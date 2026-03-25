<script lang="ts" setup>
import type { User as BaseUser } from "@/types";
import { computed, onMounted, ref, watch } from "vue";
import type { IfcGroupSchedule } from "@/services/ifc_schedules";
import ifcSchedulesService from "@/services/ifc_schedules";
import { useAuthStore, useGroupStore } from "@/stores";
import UserAccessLogsPanel from "./UserAccessLogsPanel.vue";
import UserBioPanel from "./UserBioPanel.vue";
import UserCardsPanel from "./UserCardsPanel.vue";
import UserGeneralTab from "./UserGeneralTab.vue";
import UserGroupsTab from "./UserGroupsTab.vue";
import UserPinTab from "./UserPinTab.vue";
import UserSchedulesTab from "./UserSchedulesTab.vue";
import UserTemporaryReleasePanel from "./UserTemporaryReleasePanel.vue";

interface User extends Omit<BaseUser, "user_groups"> {
  user_groups?: (number | { id: number; name: string })[];
}

const props = defineProps<{
  modelValue: boolean;
  user: User | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", value: User): void;
}>();

const groupStore = useGroupStore();
const authStore = useAuthStore();

const tab = ref("dados");
const userGroups = ref<number[]>([]);
const isVisitor = ref(false);
const deviceAdmin = ref(false);
const name = ref("");
const email = ref("");
const password = ref("");
const appRole = ref<BaseUser["app_role"]>("");
const panelAccessOnly = ref(false);
const registration = ref("");
const pin = ref("");
const loading = ref(false);
const schedulesLoading = ref(false);
const schedulesError = ref("");
const groupSchedules = ref<IfcGroupSchedule[]>([]);
const hasEmailField = ref(false);
const hasAppRoleField = ref(false);
const hasPanelAccessOnlyField = ref(false);
const hasUserTypeField = ref(false);
const hasDeviceAdminField = ref(false);
const lastScheduleKey = ref("");

const isSisaeViewer = computed(() => authStore.role === "sisae");
const panelRoles = ["admin", "guarita", "sisae"] as const;
const roleOptions = [
  { title: "Sem perfil do painel", value: "" },
  { title: "Administrador", value: "admin" },
  { title: "Guarita", value: "guarita" },
  { title: "SISAE", value: "sisae" },
];

const currentTargetRole = computed(() => {
  const directRole = props.user?.app_role;
  const effectiveRole = props.user?.effective_app_role;
  return (directRole || effectiveRole || appRole.value || "") as string;
});

const canShowPasswordField = computed(() =>
  panelRoles.includes(currentTargetRole.value as (typeof panelRoles)[number]),
);

const selectedGroupNames = computed(() => {
  const namesFromStore = userGroups.value
    .map((groupId) => groupStore.groups.find((group) => group.id === groupId)?.name)
    .filter((groupName): groupName is string => Boolean(groupName));

  if (namesFromStore.length > 0) {
    return namesFromStore;
  }

  return (
    props.user?.user_groups
      ?.map((group) => (typeof group === "number" ? "" : group.name))
      .filter((groupName): groupName is string => Boolean(groupName)) || []
  );
});

function hasOwn(obj: unknown, key: string): boolean {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

async function loadGroupSchedules(force = false) {
  const groupNames = selectedGroupNames.value;
  const scheduleKey = groupNames.join("|");

  if (!props.modelValue || tab.value !== "horarios") {
    return;
  }

  if (groupNames.length === 0) {
    groupSchedules.value = [];
    schedulesError.value = "";
    lastScheduleKey.value = "";
    return;
  }

  if (!force && scheduleKey === lastScheduleKey.value && groupSchedules.value.length > 0) {
    return;
  }

  schedulesLoading.value = true;
  schedulesError.value = "";

  try {
    groupSchedules.value = await ifcSchedulesService.getSchedulesByGroupNames(groupNames);
    lastScheduleKey.value = scheduleKey;

    if (groupSchedules.value.length === 0) {
      schedulesError.value = "Nenhum horario encontrado para as turmas selecionadas.";
    }
  } catch (error) {
    console.error(error);
    groupSchedules.value = [];
    schedulesError.value =
      "Nao foi possivel carregar os horarios do site do IFC. Se o navegador bloquear a leitura, sera preciso usar um proxy.";
  } finally {
    schedulesLoading.value = false;
  }
}

watch(
  () => props.user,
  (newUser) => {
    if (!newUser) {
      return;
    }

    hasEmailField.value = hasOwn(newUser, "email");
    hasAppRoleField.value = hasOwn(newUser, "app_role");
    hasPanelAccessOnlyField.value = hasOwn(newUser, "panel_access_only");
    hasUserTypeField.value = hasOwn(newUser, "user_type_id");
    hasDeviceAdminField.value = hasOwn(newUser, "device_admin");

    name.value = newUser.name;
    email.value = hasEmailField.value ? (newUser.email ?? "") : "";
    password.value = "";
    appRole.value = hasAppRoleField.value ? (newUser.app_role ?? "") : "";
    panelAccessOnly.value = hasPanelAccessOnlyField.value ? !!newUser.panel_access_only : false;
    registration.value = newUser.registration ?? "";
    pin.value = newUser.pin ?? "";
    isVisitor.value = hasUserTypeField.value ? newUser.user_type_id === 1 : false;
    deviceAdmin.value = hasDeviceAdminField.value ? !!newUser.device_admin : false;
    userGroups.value = newUser.user_groups?.map((group) => (typeof group === "number" ? group : group.id)) || [];
    groupSchedules.value = [];
    schedulesError.value = "";
    lastScheduleKey.value = "";
  },
  { immediate: true },
);

watch(
  [() => props.modelValue, tab, selectedGroupNames],
  async ([isOpen, currentTab]) => {
    if (!isOpen || currentTab !== "horarios") {
      return;
    }

    await loadGroupSchedules();
  },
  { immediate: true },
);

function closeDialog() {
  emit("update:modelValue", false);
}

async function salvarUsuario() {
  if (!props.user) {
    return;
  }

  const payload: User = {
    ...props.user,
    name: name.value,
    registration: registration.value,
    user_groups: userGroups.value,
  };

  if (canShowPasswordField.value && password.value.trim()) {
    payload.password = password.value;
  }

  if (hasEmailField.value) {
    payload.email = email.value;
  }
  if (hasAppRoleField.value) {
    payload.app_role = appRole.value;
  }
  if (hasPanelAccessOnlyField.value) {
    payload.panel_access_only = panelAccessOnly.value;
  }
  if (hasUserTypeField.value) {
    payload.user_type_id = isVisitor.value ? 1 : (null as unknown as number);
  }
  if (hasDeviceAdminField.value) {
    payload.device_admin = deviceAdmin.value;
  }

  emit("save", payload);
  closeDialog();
}

onMounted(async () => {
  loading.value = true;
  try {
    await groupStore.loadGroups();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-dialog
    :max-width="tab === 'horarios' ? 1280 : 900"
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="props.user">
      <v-card-title class="text-h5">Editar Usuário</v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
          <v-tab value="departamentos" v-if="props.user.name && props.user.app_role == 'admin'">Grupos</v-tab>
          <v-tab value="cartoes" v-if="props.user.name && props.user.app_role == 'admin'">Cartões</v-tab>
          <v-tab value="horarios" v-if="props.user.name">Horários</v-tab>
          <v-tab value="liberacao" v-if="props.user.id">Liberação temporária</v-tab>
          <v-tab value="pin" v-if="props.user.pin && props.user.app_role == 'admin'">PIN</v-tab>
          <v-tab value="biometria" v-if="props.user.name && props.user.app_role == 'admin'">Biometria</v-tab>
          <v-tab value="acessos" v-if="props.user.name">Acessos</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="dados">
            <UserGeneralTab
              :app-role="appRole"
              :can-show-password-field="canShowPasswordField"
              :device-admin="deviceAdmin"
              :email="email"
              :has-app-role-field="hasAppRoleField"
              :has-device-admin-field="hasDeviceAdminField"
              :has-email-field="hasEmailField"
              :has-panel-access-only-field="hasPanelAccessOnlyField"
              :has-user-type-field="hasUserTypeField"
              :is-sisae-viewer="isSisaeViewer"
              :is-visitor="isVisitor"
              :name="name"
              :panel-access-only="panelAccessOnly"
              :password="password"
              :registration="registration"
              :role-options="roleOptions"
              @update:app-role="appRole = $event"
              @update:device-admin="deviceAdmin = $event"
              @update:email="email = $event"
              @update:is-visitor="isVisitor = $event"
              @update:name="name = $event"
              @update:panel-access-only="panelAccessOnly = $event"
              @update:password="password = $event"
              @update:registration="registration = $event"
            />
          </v-window-item>

          <v-window-item value="departamentos">
            <UserGroupsTab
              :groups="groupStore.groups"
              :loading="loading"
              :user-groups="userGroups"
              @update:user-groups="userGroups = $event"
            />
          </v-window-item>

          <v-window-item value="cartoes">
            <UserCardsPanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="horarios">
            <UserSchedulesTab
              :group-schedules="groupSchedules"
              :schedules-error="schedulesError"
              :schedules-loading="schedulesLoading"
              :selected-group-names="selectedGroupNames"
              @refresh="loadGroupSchedules(true)"
            />
          </v-window-item>

          <v-window-item value="liberacao">
            <UserTemporaryReleasePanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="pin">
            <UserPinTab :pin="pin" />
          </v-window-item>

          <v-window-item value="biometria">
            <UserBioPanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="acessos">
            <UserAccessLogsPanel :user-id="props.user.id" />
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="salvarUsuario">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
