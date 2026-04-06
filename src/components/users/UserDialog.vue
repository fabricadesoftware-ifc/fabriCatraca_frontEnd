<script lang="ts" setup>
import type { User as BaseUser } from "@/types";
import { computed, onMounted, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import type { IfcGroupSchedule } from "@/services/ifc_schedules";
import ifcSchedulesService from "@/services/ifc_schedules";
import { UploaderService } from "@/services";
import CardEnrollService from "@/services/card_enroll";
import { useAuthStore, useDeviceStore, useGroupStore } from "@/stores";
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
  minimalMode?: boolean;
  saveLabel?: string;
  saveButtonLabel?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", value: User): void;
}>();

const groupStore = useGroupStore();
const deviceStore = useDeviceStore();
const authStore = useAuthStore();

const tab = ref("dados");
const userGroups = ref<number[]>([]);
const isVisitor = ref(false);
const deviceAdmin = ref(false);
const name = ref("");
const email = ref("");
const cpf = ref("");
const phone = ref("");
const password = ref("");
const appRole = ref<BaseUser["app_role"]>("");
const panelAccessOnly = ref(false);
const registration = ref("");
const pin = ref("");
const deviceScope = ref<BaseUser["device_scope"]>("all_active");
const selectedDeviceIds = ref<number[]>([]);
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
const pictureFile = ref<File | null>(null);
const pictureUploadPending = ref(false);
const pictureRemoved = ref(false);
const cardEnrollDevice = ref<number | null>(null);
const capturedCardValue = ref<number | null>(null);
const enrollingCard = ref(false);

const isSisaeViewer = computed(() => authStore.role === "sisae");
const isMinimalMode = computed(() => !!props.minimalMode);
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
    cpf.value = newUser.cpf ?? "";
    phone.value = newUser.phone ?? "";
    password.value = "";
    appRole.value = hasAppRoleField.value ? (newUser.app_role ?? "") : "";
    panelAccessOnly.value = hasPanelAccessOnlyField.value ? !!newUser.panel_access_only : false;
    registration.value = newUser.registration ?? "";
    pin.value = newUser.pin ?? "";
    deviceScope.value = newUser.device_scope ?? "all_active";
    selectedDeviceIds.value =
      newUser.selected_device_ids ??
      newUser.selected_devices?.map((device) => device.id) ??
      [];
    isVisitor.value = hasUserTypeField.value ? newUser.user_type_id === 1 : false;
    deviceAdmin.value = hasDeviceAdminField.value ? !!newUser.device_admin : false;
    userGroups.value =
      newUser.user_groups?.map((group) => (typeof group === "number" ? group : group.id)) || [];
    groupSchedules.value = [];
    schedulesError.value = "";
    lastScheduleKey.value = "";
    pictureFile.value = null;
    pictureUploadPending.value = false;
    pictureRemoved.value = false;
    cardEnrollDevice.value = null;
    capturedCardValue.value = null;
    enrollingCard.value = false;
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

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen || !isMinimalMode.value) {
      return;
    }

    tab.value = "dados";
    isVisitor.value = true;
    panelAccessOnly.value = false;
    deviceAdmin.value = false;
    appRole.value = "";
  },
);

function closeDialog() {
  emit("update:modelValue", false);
}

function onSelectPicture(file: File | null) {
  pictureFile.value = file;
  pictureRemoved.value = false;
}

function onRemovePicture() {
  pictureFile.value = null;
  pictureRemoved.value = true;
}

async function startCardEnroll() {
  if (!cardEnrollDevice.value) {
    toast.warning("Selecione uma catraca para capturar o cartao");
    return;
  }

  enrollingCard.value = true;
  try {
    const result = await CardEnrollService.enrollCard(cardEnrollDevice.value);
    capturedCardValue.value = result.card_value;
    toast.success(`Cartao capturado com sucesso! (${result.card_value})`);
  } catch (err: any) {
    const msg = err?.response?.data?.error || "Erro ao capturar cartao";
    toast.error(msg);
  } finally {
    enrollingCard.value = false;
  }
}

async function salvarUsuario() {
  if (!props.user) {
    return;
  }

  if (isMinimalMode.value && !phone.value.trim()) {
    toast.warning("Telefone e obrigatorio para cadastrar visitante.");
    return;
  }

  // In minimal mode, use create_with_card if card was captured
  if (isMinimalMode.value && capturedCardValue.value && cardEnrollDevice.value) {
    try {
      pictureUploadPending.value = true;
      let pictureId: number | undefined;

      if (pictureFile.value) {
        const archive = await UploaderService.uploadArchive(pictureFile.value);
        pictureId = archive.id;
      }

      const result = await CardEnrollService.createUserWithCard({
        enrollment_device_id: cardEnrollDevice.value,
        name: name.value,
        phone: phone.value,
        cpf: cpf.value || undefined,
        registration: registration.value || undefined,
        picture_id: pictureId || undefined,
        user_type_id: 1,
      });

      toast.success("Visitante e cartao cadastrados com sucesso!");
      emit("save", result.user);
      closeDialog();
      return;
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao cadastrar visitante com cartao";
      toast.error(msg);
      pictureUploadPending.value = false;
      return;
    } finally {
      pictureUploadPending.value = false;
    }
  }

  let savedUser = props.user;

  // Upload picture first if selected
  if (pictureFile.value) {
    try {
      pictureUploadPending.value = true;
      const archive = await UploaderService.uploadArchive(pictureFile.value);
      savedUser = {
        ...savedUser,
        picture_id: archive.id,
      };
    } catch (error) {
      toast.error("Erro ao enviar a foto. Verifique o arquivo e tente novamente.");
      pictureUploadPending.value = false;
      return;
    } finally {
      pictureUploadPending.value = false;
    }
  }

  const payload: User = {
    ...savedUser,
    name: name.value,
    cpf: cpf.value,
    phone: phone.value,
    registration: registration.value,
    user_groups: userGroups.value,
    device_scope: panelAccessOnly.value ? "none" : deviceScope.value,
    selected_device_ids: panelAccessOnly.value ? [] : selectedDeviceIds.value,
    picture_id: savedUser.picture_id,
    remove_picture: pictureRemoved.value,
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
    await deviceStore.loadDevices();
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
      <v-card-title class="d-flex text-h5 justify-space-between">
        {{ isMinimalMode ? "Cadastrar Visitante" : isSisaeViewer ? "Liberar Usuario" : "Editar Usuario" }}
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
          <v-tab value="departamentos" v-if="props.user.name && authStore.role == 'admin' && !isMinimalMode">Grupos</v-tab>
          <v-tab value="cartoes" v-if="props.user.name && authStore.role == 'admin' && !isMinimalMode">Cartoes</v-tab>
          <v-tab value="horarios" v-if="props.user.name && !isMinimalMode">Horarios</v-tab>
          <v-tab value="liberacao" v-if="props.user.id && !isMinimalMode">Liberacao temporaria</v-tab>
          <v-tab value="pin" v-if="props.user.pin && authStore.role == 'admin' && !isMinimalMode">PIN</v-tab>
          <v-tab value="biometria" v-if="props.user.name && authStore.role == 'admin' && !isMinimalMode">Biometria</v-tab>
          <v-tab value="acessos" v-if="props.user.name && !isMinimalMode">Acessos</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="dados">
            <UserGeneralTab
              :app-role="appRole"
              :can-show-password-field="canShowPasswordField"
              :cpf="cpf"
              :device-admin="deviceAdmin"
              :device-options="deviceStore.devices.filter((device) => device.is_active)"
              :device-scope="deviceScope"
              :email="email"
              :groups="selectedGroupNames"
              :has-app-role-field="hasAppRoleField"
              :has-device-admin-field="hasDeviceAdminField"
              :has-email-field="hasEmailField"
              :has-panel-access-only-field="hasPanelAccessOnlyField"
              :has-user-type-field="hasUserTypeField"
              :is-sisae-viewer="isSisaeViewer"
              :is-visitor="isVisitor"
              :minimal-mode="isMinimalMode"
              :name="name"
              :panel-access-only="panelAccessOnly"
              :password="password"
              :phone="phone"
              :picture-url="props.user.picture_url"
              :registration="registration"
              :role-options="roleOptions"
              :selected-device-ids="selectedDeviceIds"
              @remove-picture="onRemovePicture"
              @select-picture="onSelectPicture"
              @update:app-role="appRole = $event"
              @update:cpf="cpf = $event"
              @update:device-admin="deviceAdmin = $event"
              @update:device-scope="deviceScope = $event"
              @update:email="email = $event"
              @update:is-visitor="isVisitor = $event"
              @update:name="name = $event"
              @update:panel-access-only="panelAccessOnly = $event"
              @update:password="password = $event"
              @update:phone="phone = $event"
              @update:registration="registration = $event"
              @update:selected-device-ids="selectedDeviceIds = $event"
            />

            <!-- Card enrollment section (minimal mode only) -->
            <v-card v-if="isMinimalMode" class="mt-4" variant="outlined">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon class="mr-2" color="primary" icon="mdi-credit-card-wireless" />
                Cadastrar Cartao
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="cardEnrollDevice"
                      item-title="name"
                      item-value="id"
                      :items="deviceStore.devices.filter((d) => d.is_active)"
                      label="Catraca para captura"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6" class="d-flex align-center">
                    <v-btn
                      color="primary"
                      :loading="enrollingCard"
                      :disabled="!cardEnrollDevice"
                      prepend-icon="mdi-credit-card-plus"
                      block
                      @click="startCardEnroll"
                    >
                      Capturar Cartao
                    </v-btn>
                  </v-col>
                </v-row>
                <v-alert
                  v-if="capturedCardValue"
                  class="mt-2"
                  color="success"
                  density="compact"
                  icon="mdi-check-circle"
                  variant="tonal"
                >
                  Cartao capturado: <strong>{{ capturedCardValue }}</strong>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="departamentos" v-if="appRole == 'admin' && !isMinimalMode">
            <UserGroupsTab
              :groups="groupStore.groups"
              :loading="loading"
              :user-groups="userGroups"
              @update:user-groups="userGroups = $event"
            />
          </v-window-item>

          <v-window-item value="cartoes" v-if="appRole == 'admin' && !isMinimalMode">
            <UserCardsPanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="horarios" v-if="!isMinimalMode">
            <UserSchedulesTab
              :group-schedules="groupSchedules"
              :schedules-error="schedulesError"
              :schedules-loading="schedulesLoading"
              :selected-group-names="selectedGroupNames"
              @refresh="loadGroupSchedules(true)"
            />
          </v-window-item>

          <v-window-item value="liberacao" v-if="!isMinimalMode">
            <UserTemporaryReleasePanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="pin" v-if="appRole == 'admin' && !isMinimalMode">
            <UserPinTab :pin="pin" />
          </v-window-item>

          <v-window-item value="biometria" v-if="!isMinimalMode" :disabled="appRole == 'admin'">
            <UserBioPanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="acessos" v-if="!isMinimalMode">
            <UserAccessLogsPanel :user-id="props.user.id" />
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions v-if="authStore.role == 'admin' || isMinimalMode">
        <v-spacer />
        <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" :disabled="pictureUploadPending" @click="salvarUsuario">
          {{ pictureUploadPending ? "Enviando foto..." : props.saveButtonLabel || "Salvar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
