<script lang="ts" setup>
import type { User as BaseUser } from "@/types";
import { computed, onMounted, ref, toRef, watch } from "vue";
import { toast } from "vue3-toastify";
import { UploaderService } from "@/services";
import CardEnrollService from "@/services/card_enroll";
import { useAuthStore, useDeviceStore, useGroupStore } from "@/stores";
import { useUserCardEnrollment } from "@/composables/useUserCardEnrollment";
import { useUserFormState, type UserDialogUser } from "@/composables/useUserFormState";
import { useUserGroupSchedules } from "@/composables/useUserGroupSchedules";
import UserAccessLogsPanel from "./UserAccessLogsPanel.vue";
import UserBioPanel from "./UserBioPanel.vue";
import UserCardsPanel from "./UserCardsPanel.vue";
import UserGeneralTabCard from "./UserGeneralTabCard.vue";
import UserGeneralTab from "./UserGeneralTab.vue";
import UserGroupsTab from "./UserGroupsTab.vue";
import UserPinTab from "./UserPinTab.vue";
import UserSchedulesTab from "./UserSchedulesTab.vue";
import UserTemporaryReleasePanel from "./UserTemporaryReleasePanel.vue";
import { buildUserPayload } from "./userPayloadBuilder";

interface User extends UserDialogUser {}

const props = defineProps<{
  modelValue: boolean;
  user: User | null;
  dialogMode?: "default" | "release-only" | "register-only";
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
const loading = ref(false);
const pictureFile = ref<File | null>(null);
const pictureUploadPending = ref(false);
const pictureRemoved = ref(false);
const userRef = toRef(props, "user");
const modelValueRef = toRef(props, "modelValue");

const isSisaeViewer = computed(() => authStore.role === "sisae");
const isMinimalMode = computed(() => !!props.minimalMode);
const isReleaseOnlyMode = computed(() => props.dialogMode === "release-only");
const isRegisterOnlyMode = computed(() => props.dialogMode === "register-only");
const canManagePhoto = computed(() => authStore.role === "admin" || authStore.role === "sisae");
const canManageBiometry = computed(
  () => (authStore.role === "admin" || authStore.role === "sisae") && !isMinimalMode.value,
);
const canSaveUser = computed(
  () => authStore.role === "admin" || authStore.role === "sisae" || isMinimalMode.value,
);
const { form, fieldFlags, setMinimalDefaults } = useUserFormState(userRef);
const {
  cardEnrollDevice,
  capturedCardValue,
  enrollingCard,
  existingCards,
  deletingCardId,
  deleteExistingCard,
  startCardEnroll,
} = useUserCardEnrollment(userRef, modelValueRef, isMinimalMode);
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
  return (directRole || effectiveRole || form.appRole || "") as string;
});

const canShowPasswordField = computed(() =>
  panelRoles.includes(currentTargetRole.value as (typeof panelRoles)[number]),
);

const selectedGroupNames = computed(() => {
  const namesFromStore = form.userGroups
    .map((groupId) => groupStore.groups.find((group) => group.id === groupId)?.name)
    .filter((groupName): groupName is string => Boolean(groupName));

  if (namesFromStore.length > 0) {
    return namesFromStore;
  }

  return (
    userRef.value?.user_groups
      ?.map((group) => (typeof group === "number" ? "" : group.name))
      .filter((groupName): groupName is string => Boolean(groupName)) || []
  );
});
const { schedulesLoading, schedulesError, groupSchedules, loadGroupSchedules, resetSchedules } =
  useUserGroupSchedules(selectedGroupNames, modelValueRef, tab);

watch(
  userRef,
  () => {
    pictureFile.value = null;
    pictureUploadPending.value = false;
    pictureRemoved.value = false;
    resetSchedules();
  },
  { immediate: true },
);

watch(modelValueRef, (isOpen) => {
  if (!isOpen) {
    return;
  }

  if (isReleaseOnlyMode.value && props.user?.id) {
    tab.value = "liberacao";
    return;
  }

  if (!isMinimalMode.value) {
    return;
  }

  tab.value = "dados";
  setMinimalDefaults();
});

function updateForm(patch: Partial<typeof form>) {
  Object.assign(form, patch);
}

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

async function salvarUsuario() {
  if (!props.user) {
    return;
  }

  if (isMinimalMode.value && !form.phone.trim()) {
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
        name: form.name,
        phone: form.phone,
        cpf: form.cpf || undefined,
        registration: form.registration || undefined,
        picture_id: pictureId || undefined,
        card_value: capturedCardValue.value,
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

  const payload = buildUserPayload(
    savedUser,
    form,
    fieldFlags,
    canShowPasswordField.value,
    pictureRemoved.value,
  );

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
        {{
          isMinimalMode
            ? "Cadastrar Visitante"
            : isReleaseOnlyMode
              ? "Liberar Usuario"
              : "Editar Usuario"
        }}
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados" v-if="!isReleaseOnlyMode">Dados Gerais</v-tab>
          <v-tab
            value="departamentos"
            v-if="
              props.user.name && authStore.role == 'admin' && !isMinimalMode && !isReleaseOnlyMode
            "
            >Grupos</v-tab
          >
          <v-tab
            value="cartoes"
            v-if="
              props.user.name && authStore.role == 'admin' && !isMinimalMode && !isReleaseOnlyMode
            "
            >Cartoes</v-tab
          >
          <v-tab
            value="horarios"
            v-if="props.user.name && !isMinimalMode && !isReleaseOnlyMode && !isRegisterOnlyMode"
            >Horarios</v-tab
          >
          <v-tab value="liberacao" v-if="props.user.id && !isMinimalMode && !isRegisterOnlyMode"
            >Liberacao temporaria</v-tab
          >
          <v-tab
            value="pin"
            v-if="
              props.user.pin && authStore.role == 'admin' && !isMinimalMode && !isReleaseOnlyMode
            "
            >PIN</v-tab
          >
          <v-tab value="biometria" v-if="props.user.name && canManageBiometry && !isReleaseOnlyMode"
            >Biometria</v-tab
          >
          <v-tab
            value="acessos"
            v-if="props.user.name && !isMinimalMode && !isReleaseOnlyMode && !isRegisterOnlyMode"
            >Acessos</v-tab
          >
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="dados" v-if="!isReleaseOnlyMode">
            <UserGeneralTab
              :form="form"
              :field-flags="fieldFlags"
              :can-manage-photo="canManagePhoto"
              :can-show-password-field="canShowPasswordField"
              :device-options="deviceStore.devices.filter((device) => device.is_active)"
              :groups="selectedGroupNames"
              :is-sisae-viewer="isSisaeViewer"
              :minimal-mode="isMinimalMode"
              :picture-url="props.user.picture_url"
              :role-options="roleOptions"
              @remove-picture="onRemovePicture"
              @select-picture="onSelectPicture"
              @update:form="updateForm"
            />

            <UserGeneralTabCard
              v-if="isMinimalMode"
              :card-enroll-device="cardEnrollDevice"
              :captured-card-value="capturedCardValue"
              :deleting-card-id="deletingCardId"
              :devices="deviceStore.devices"
              :enrolling-card="enrollingCard"
              :existing-cards="existingCards"
              @delete-card="deleteExistingCard"
              @start-enroll="startCardEnroll"
              @update:card-enroll-device="cardEnrollDevice = $event"
            />
          </v-window-item>

          <v-window-item value="departamentos" v-if="authStore.role == 'admin' && !isMinimalMode">
            <UserGroupsTab
              :groups="groupStore.groups"
              :loading="loading"
              :user-groups="form.userGroups"
              @update:user-groups="form.userGroups = $event"
            />
          </v-window-item>

          <v-window-item value="cartoes" v-if="authStore.role == 'admin' && !isMinimalMode">
            <UserCardsPanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="horarios" v-if="!isMinimalMode && !isRegisterOnlyMode">
            <UserSchedulesTab
              :group-schedules="groupSchedules"
              :schedules-error="schedulesError"
              :schedules-loading="schedulesLoading"
              :selected-group-names="selectedGroupNames"
              @refresh="loadGroupSchedules(true)"
            />
          </v-window-item>

          <v-window-item value="liberacao" v-if="!isMinimalMode && !isRegisterOnlyMode">
            <UserTemporaryReleasePanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="pin" v-if="authStore.role == 'admin' && !isMinimalMode">
            <UserPinTab :pin="form.pin" />
          </v-window-item>

          <v-window-item value="biometria" v-if="canManageBiometry">
            <UserBioPanel :user-id="props.user.id" />
          </v-window-item>

          <v-window-item value="acessos" v-if="!isMinimalMode && !isRegisterOnlyMode">
            <UserAccessLogsPanel :user-id="props.user.id" />
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions v-if="canSaveUser && !isReleaseOnlyMode">
        <v-spacer />
        <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="pictureUploadPending"
          @click="salvarUsuario"
        >
          {{ pictureUploadPending ? "Enviando foto..." : props.saveButtonLabel || "Salvar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
