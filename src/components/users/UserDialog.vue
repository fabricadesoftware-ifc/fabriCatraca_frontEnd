<script lang="ts" setup>
import type { User as BaseUser } from "@/types";
import { computed, onMounted, ref, toValue, watch } from "vue";
import { useAuthStore, useGroupStore } from "@/stores";
import UserAccessLogsPanel from "./UserAccessLogsPanel.vue";
import UserBioPanel from "./UserBioPanel.vue";
import UserCardsPanel from "./UserCardsPanel.vue";
import UserTemporaryReleasePanel from "./UserTemporaryReleasePanel.vue";

interface User extends Omit<BaseUser, "user_groups"> {
  user_groups?: (number | { id: number; name: string })[];
}

const props = defineProps<{
  modelValue: boolean;
  user: User | null;
}>();

const userGroups = ref<number[]>([]);
function setUserGroups(newGroups: number[]) {
  userGroups.value = newGroups;
}

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", value: User): void;
}>();

const groupStore = useGroupStore();
const authStore = useAuthStore();
const isSisaeViewer = computed(() => authStore.role === "sisae");
const panelRoles = ["admin", "guarita", "sisae"] as const;

const currentTargetRole = computed(() => {
  const directRole = props.user?.app_role;
  const effectiveRole = props.user?.effective_app_role;
  return (directRole || effectiveRole || appRole.value || "") as string;
});

const canShowPasswordField = computed(() =>
  panelRoles.includes(currentTargetRole.value as (typeof panelRoles)[number]),
);
const tab = ref("dados");
const isVisitor = ref(false);
const deviceAdmin = ref(false);
const name = ref("");
const email = ref("");
const password = ref("");
const appRole = ref<BaseUser["app_role"]>("");
const panelAccessOnly = ref(false);
const registration = ref("");
const pin = ref("");
const showPin = ref(false);
const loading = ref(false);
const hasEmailField = ref(false);
const hasAppRoleField = ref(false);
const hasPanelAccessOnlyField = ref(false);
const hasUserTypeField = ref(false);
const hasDeviceAdminField = ref(false);
const roleOptions = [
  { title: "Sem perfil do painel", value: "" },
  { title: "Administrador", value: "admin" },
  { title: "Guarita", value: "guarita" },
  { title: "SISAE", value: "sisae" },
];

function hasOwn(obj: unknown, key: string): boolean {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

// Atualiza os campos locais quando o props.user mudar
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
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
      showPin.value = false;
      isVisitor.value = hasUserTypeField.value ? newUser.user_type_id === 1 : false;
      deviceAdmin.value = hasDeviceAdminField.value ? !!newUser.device_admin : false;
      userGroups.value = newUser.user_groups?.map((g) => (typeof g === "number" ? g : g.id)) || [];
    }
  },
  { immediate: true },
);

function closeDialog() {
  emit("update:modelValue", false);
}

async function salvarUsuario() {
  if (props.user) {
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

    emit("save", {
      ...payload,
    });
    closeDialog();
  }
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
    max-width="900"
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="props.user">
      <v-card-title class="text-h5">Editar Usuário</v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
          <v-tab value="departamentos" v-if="props.user.name">Grupos</v-tab>
          <v-tab value="cartoes" v-if="props.user.name">Cartões</v-tab>
          <v-tab value="horarios" v-if="props.user.name">Horários</v-tab>
          <v-tab value="liberacao" v-if="props.user.id">Liberação temporária</v-tab>
          <v-tab value="pin" v-if="props.user.name">PIN</v-tab>
          <v-tab value="biometria" v-if="props.user.name">Biometria</v-tab>
          <v-tab value="acessos" v-if="props.user.name">Acessos</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- Aba Dados Gerais -->
          <v-window-item value="dados">
            <v-container>
              <v-row>
                <!-- Coluna esquerda -->
                <v-col cols="8">
                  <v-text-field
                    v-model="name"
                    label="Nome"
                    required
                    :rules="[(v) => !!v || 'Nome é obrigatório']"
                  />
                  <v-text-field v-if="hasEmailField" v-model="email" label="E-mail para login" />
                  <v-select
                    v-if="hasAppRoleField"
                    v-model="appRole"
                    :items="roleOptions"
                    item-title="title"
                    item-value="value"
                    label="Perfil do painel"
                    :disabled="isSisaeViewer"
                  />
                  <v-switch
                    v-if="hasPanelAccessOnlyField"
                    v-model="panelAccessOnly"
                    color="info"
                    label="Conta somente do painel"
                    :disabled="isSisaeViewer"
                  />
                  <v-text-field
                    v-if="canShowPasswordField"
                    v-model="password"
                    label="Senha do painel"
                    placeholder="Preencha para definir ou alterar a senha"
                    type="password"
                  />
                  <v-text-field v-model="registration" label="Matrícula" />

                  <v-switch
                    v-if="hasUserTypeField"
                    v-model="isVisitor"
                    color="warning"
                    label="Visitante"
                    :disabled="isSisaeViewer"
                  />
                  <v-switch
                    v-if="hasDeviceAdminField"
                    v-model="deviceAdmin"
                    color="primary"
                    label="Administrador da catraca"
                    :disabled="isSisaeViewer"
                  />
                </v-col>

                <!-- Coluna direita -->
                <!-- <v-col class="d-flex flex-column align-center" cols="4">
                  <v-avatar class="mb-4" size="150">
                    <v-img
                      src="https://cdn.vuetifyjs.com/images/profiles/avatar.jpg"
                    />
                  </v-avatar>
                  <v-btn class="mb-2" color="primary">Arquivo</v-btn>
                  <v-btn class="mb-2" color="primary">Câmera</v-btn>
                  <v-btn class="mb-2" color="error">Remover</v-btn>
                </v-col> -->
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Outras abas -->
          <v-window-item value="departamentos">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-card>
                    <v-card-text class="pa-4">
                      <v-progress-linear v-if="loading" color="primary" indeterminate />

                      <template v-else>
                        <div class="text-subtitle-1 mb-4">
                          Selecione os grupos aos quais o usuário pertence:
                        </div>

                        <v-list lines="two">
                          <v-list-item
                            v-for="group in groupStore.groups"
                            :key="group.id"
                            :title="group.name"
                          >
                            <template #append>
                              <v-switch
                                color="primary"
                                hide-details
                                :model-value="userGroups.includes(group.id)"
                                @update:model-value="
                                  (value) => {
                                    const groups = toValue(userGroups);
                                    const newGroups = value
                                      ? [...groups, group.id]
                                      : groups.filter((gid: number) => gid !== group.id);
                                    setUserGroups(newGroups);
                                  }
                                "
                              />
                            </template>
                          </v-list-item>
                        </v-list>

                        <div v-if="groupStore.groups.length === 0" class="text-center pa-4">
                          <v-icon class="mb-2" color="grey" icon="mdi-account-group" size="48" />
                          <div class="text-body-1 text-grey">Nenhum grupo disponível</div>
                        </div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
          <v-window-item value="cartoes">
            <UserCardsPanel :user-id="props.user.id" />
          </v-window-item>
          <v-window-item value="horarios"><p>Configurar horários...</p></v-window-item>
          <v-window-item value="liberacao">
            <UserTemporaryReleasePanel :user-id="props.user.id" />
          </v-window-item>
          <v-window-item value="pin">
            <v-container>
              <v-row justify="center">
                <v-col cols="12" md="6">
                  <v-card elevation="2" rounded="lg">
                    <v-card-text class="text-center pa-6">
                      <v-icon class="mb-4" color="primary" icon="mdi-lock" size="48" />
                      <div class="text-subtitle-1 mb-4">PIN do Usuário</div>

                      <div v-if="pin" class="d-flex flex-column align-center">
                        <div class="d-flex align-center ga-2 mb-4">
                          <v-text-field
                            class="px-4 pin-input"
                            density="comfortable"
                            hide-details
                            :model-value="pin"
                            readonly
                            :type="showPin ? 'text' : 'password'"
                            variant="outlined"
                            style="
                              min-width: 220px;
                              max-width: 100%;
                              font-size: 1.5rem;
                              letter-spacing: 0.3em;
                            "
                          >
                            <template #append-inner>
                              <v-btn
                                density="comfortable"
                                :icon="showPin ? 'mdi-eye-off' : 'mdi-eye'"
                                variant="text"
                                @click="showPin = !showPin"
                              />
                            </template>
                          </v-text-field>
                        </div>

                        <v-chip color="success" prepend-icon="mdi-check-circle" variant="tonal">
                          PIN cadastrado
                        </v-chip>
                      </div>

                      <div v-else class="d-flex flex-column align-center">
                        <v-chip color="warning" prepend-icon="mdi-alert-circle" variant="tonal">
                          Nenhum PIN cadastrado
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
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
