<script setup lang="ts">
import type { User as BaseUser } from "@/types";
import { computed, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import { useUserStore } from "@/stores";
import UserDialog from "./UserDialog.vue";

interface User extends Omit<BaseUser, "user_groups"> {
  user_groups?: (number | { id: number; name: string })[];
}

const props = defineProps<{
  users: User[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  app_role: string;
  title?: string;
  createLabel?: string;
  canCreate?: boolean;
  minimalDialog?: boolean;
  newUserDefaults?: Partial<User>;
  reloadQuery?: Record<string, unknown>;
}>();

const emit = defineEmits<{
  (e: "page-changed" | "item-per-page" | "search-changed", value: number | string): void;
}>();

const userStore = useUserStore();
const dialog = ref(false);
const selectedUser = ref<User | null>(null);
const selection = ref({
  selected: [] as User[],
});
const search = ref("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const canCreateUsers = computed(() => props.canCreate ?? props.app_role === "admin");

function buildReloadQuery() {
  return {
    page: userStore.current_page,
    page_size: userStore.page_size,
    ...(props.reloadQuery || {}),
  };
}

const defaultHeaders = [
  { title: "ID", key: "id", align: "start" as const },
  { title: "Nome", key: "name", align: "start" as const },
  { title: "Perfil", key: "app_role", align: "start" as const },
  { title: "Admin catraca", key: "device_admin", align: "start" as const },
  { title: "Turma", key: "user_groups", align: "start" as const },
  { title: "Matricula", key: "registration", align: "start" as const },
];

const headersByRole = {
  admin: defaultHeaders,
  guarita: defaultHeaders.filter((h) => h.key !== "app_role" && h.key !== "device_admin"),
  sisae: defaultHeaders.filter((h) => h.key !== "app_role" && h.key !== "device_admin"),
};

const tableHeaders = computed(
  () => headersByRole[props.app_role as keyof typeof headersByRole] ?? defaultHeaders,
);

watch(search, (newSearch) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    emit("search-changed", newSearch);
  }, 500);
});

async function salvarUsuario(user: User) {
  try {
    let savedUser: User;

    if (user.id === 0) {
      savedUser = await userStore.createUser({
        name: user.name,
        email: user.email,
        password: user.password,
        app_role: user.app_role,
        panel_access_only: user.panel_access_only,
        device_scope: user.panel_access_only ? "none" : user.device_scope,
        selected_device_ids: user.panel_access_only ? [] : user.selected_device_ids,
        registration: user.registration,
        user_type_id: user.user_type_id,
        device_admin: user.device_admin,
      });

      const userGroupIds = (user.user_groups || []).map((g) => (typeof g === "number" ? g : g.id));
      for (const groupId of userGroupIds) {
        await userStore.addUserToGroup(savedUser.id, groupId);
      }
    } else {
      const currentUser = await userStore.getUserById(user.id);

      if (!currentUser) {
        throw new Error("Usuario nao encontrado");
      }

      const basicDataChanged =
        currentUser.name !== user.name ||
        currentUser.email !== user.email ||
        currentUser.app_role !== user.app_role ||
        !!currentUser.panel_access_only !== !!user.panel_access_only ||
        currentUser.registration !== user.registration ||
        currentUser.user_type_id !== user.user_type_id ||
        !!currentUser.device_admin !== !!user.device_admin ||
        !!user.password;

      savedUser = basicDataChanged
        ? await userStore.updateUser(user.id, {
            name: user.name,
            email: user.email,
            password: user.password,
            app_role: user.app_role,
            panel_access_only: user.panel_access_only,
            device_scope: user.panel_access_only ? "none" : user.device_scope,
            selected_device_ids: user.panel_access_only ? [] : user.selected_device_ids,
            registration: user.registration,
            user_type_id: user.user_type_id,
            device_admin: user.device_admin,
          })
        : currentUser;

      const userGroupIds = (user.user_groups || []).map((g) => (typeof g === "number" ? g : g.id));
      const currentGroups =
        currentUser.user_groups?.map((g) => (typeof g === "number" ? g : g.id)) || [];

      const groupsToAdd = userGroupIds.filter((groupId: number) => !currentGroups.includes(groupId));
      const groupsToRemove = currentGroups.filter((groupId: number) => !userGroupIds.includes(groupId));

      for (const groupId of groupsToAdd) {
        await userStore.addUserToGroup(user.id, groupId);
      }

      for (const groupId of groupsToRemove) {
        await userStore.removeUserFromGroup(user.id, groupId);
      }
    }

    await userStore.loadUsers(buildReloadQuery());
    toast.success("Usuario salvo com sucesso.");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao salvar usuario. Por favor, tente novamente.");
  }
}

function showUserDetails(event: Event, { item }: { item: User }) {
  selectedUser.value = item;
  dialog.value = true;
}

async function removerSelecionados() {
  const selectedItems = selection.value.selected;
  if (selectedItems.length === 0) return;

  if (confirm(`Remover ${selectedItems.length} usuario(s)?`)) {
    try {
      const validUsers = selectedItems.filter(
        (user) => typeof user.id === "number" && !Number.isNaN(user.id),
      );
      if (validUsers.length === 0) {
        throw new Error("Nenhum usuario valido para remover");
      }

      await Promise.all(validUsers.map((user) => userStore.deleteUser(user.id)));
      await userStore.loadUsers(buildReloadQuery());

      const removedCount = validUsers.length;
      selection.value.selected = [];
      toast.success(`${removedCount} usuario(s) removido(s) com sucesso.`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover usuarios. Por favor, tente novamente.");
    }
  }
}

function novoUsuario() {
  selectedUser.value = {
    id: 0,
    name: "",
    registration: "",
    user_groups: [],
    device_scope: "all_active",
    selected_devices: [],
    selected_device_ids: [],
    app_role: "",
    panel_access_only: false,
    user_type_id: 1,
    device_admin: false,
    devices: [],
    email: "",
    pin: "",
    ...props.newUserDefaults,
  };
  dialog.value = true;
}

function trocarPagina(page: number) {
  emit("page-changed", page);
}

function itemsPerPageChanged(newPageSize: number) {
  emit("item-per-page", newPageSize);
}

function onSelect(items: User[]) {
  const selectedItems = Array.isArray(items) ? items : [items].filter(Boolean);
  selection.value.selected =
    selectedItems.length > 0
      ? selectedItems.map((item) => ({
          ...item,
          id: Number(item.id),
        }))
      : [];
}

function appRoleLabel(value?: string) {
  if (value === "admin") return "Administrador";
  if (value === "guarita") return "Guarita";
  if (value === "sisae") return "SISAE";
  return "Sem perfil";
}
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">{{ props.title || "Gerenciar Usuarios" }}</h2>

    <div v-if="props.app_role == 'admin'">
      <span class="mr-2 text-caption">Selecionados: {{ selection.selected.length }}</span>

      <v-btn
        class="mr-2"
        color="error"
        :disabled="selection.selected.length === 0"
        prepend-icon="mdi-delete"
        @click="removerSelecionados"
      >
        Remover Selecionados
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="novoUsuario">
        {{ props.createLabel || "Adicionar Usuario" }}
      </v-btn>
    </div>

    <div v-else-if="canCreateUsers">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="novoUsuario">
        {{ props.createLabel || "Adicionar Usuario" }}
      </v-btn>
    </div>
  </div>

  <v-text-field
    v-model="search"
    append-inner-icon="mdi-magnify"
    class="mb-4"
    clearable
    density="comfortable"
    hide-details
    label="Pesquisar por nome ou matricula"
    single-line
    variant="outlined"
  />

  <v-data-table-server
    v-model="selection.selected"
    class="rounded-lg"
    :headers="tableHeaders"
    hover
    item-key="id"
    :items="props.users"
    :items-length="props.totalItems ?? 0"
    :items-per-page="props.pageSize ?? 10"
    :loading="props.users.length === 0"
    :page="props.currentPage ?? 1"
    return-object
    :select-strategy="props.app_role === 'admin' ? 'all' : 'single'"
    :show-select="props.app_role === 'admin'"
    @click:row="showUserDetails"
    @update:items-per-page="itemsPerPageChanged"
    @update:page="trocarPagina"
    @update:selected="onSelect"
  >
    <template #item.app_role="{ item }">
      {{ appRoleLabel(item.effective_app_role || item.app_role) }}
    </template>

    <template #item.user_groups="{ item }">
      {{
        item.user_groups?.length
          ? typeof item.user_groups[0] === "object"
            ? item.user_groups[0].name
            : "Grupo " + item.user_groups[0]
          : "Nao ha grupo"
      }}
    </template>

    <template #item.device_admin="{ item }">
      <v-chip :color="item.device_admin ? 'primary' : 'grey'" size="small" variant="tonal">
        {{ item.device_admin ? "Sim" : "Nao" }}
      </v-chip>
    </template>
  </v-data-table-server>

  <UserDialog
    v-model="dialog"
    :minimal-mode="props.minimalDialog"
    :save-label="props.createLabel"
    :user="selectedUser"
    @save="salvarUsuario"
  />
</template>

<style scoped>
.v-data-table >>> tbody tr {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
</style>
