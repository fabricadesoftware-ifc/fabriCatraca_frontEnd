<script lang="ts" setup>
import type { TemporaryGroupRelease, User } from "@/types";
import { computed, onMounted, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import { TemporaryGroupReleasesService, PortalGroupsService, UsersService } from "@/services";
import { useAuthStore } from "@/stores";

type NotificationEmailOption = { title: string; value: string };

const props = defineProps<{ groupId: number; groupName?: string }>();
const authStore = useAuthStore();

const releases = ref<TemporaryGroupRelease[]>([]);
const serverUsers = ref<User[]>([]);
const loading = ref(false);
const loadingServerUsers = ref(false);
const saving = ref(false);
const cancellingId = ref<number | null>(null);
const durationMinutes = ref(5);
const notes = ref("");
const selectedPortalGroupId = ref<number | null>(null);
const portalGroups = ref<any[]>([]);
const notificationEmails = ref<string[]>([]);
const notificationMessage = ref("");
const notificationMessageDirty = ref(false);

function toDateTimeLocalValue(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

const validFrom = ref(toDateTimeLocalValue());
const validFromDate = computed(() => parseDateTimeLocalValue(validFrom.value));
const validUntilDate = computed(() => {
  if (!validFromDate.value) {
    return null;
  }

  const duration = Number.isFinite(durationMinutes.value) ? Math.max(durationMinutes.value, 0) : 0;
  const untilDate = new Date(validFromDate.value);
  untilDate.setMinutes(untilDate.getMinutes() + duration);
  return untilDate;
});

function parseDateTimeLocalValue(value: string) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatDate(value: Date | null) {
  if (!value) {
    return "--/--/----";
  }

  return value.toLocaleDateString("pt-BR");
}

function formatTime(value: Date | null) {
  if (!value) {
    return "--:--";
  }

  return value.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const generatedNotificationMessage = computed(() => {
  const groupName = props.groupName || `Turma #${props.groupId}`;
  const requesterName = authStore.user?.name || "Sistema";
  const reason = notes.value.trim() || "Nao informado";
  const releaseDate = formatDate(validFromDate.value);
  const releaseTime = formatTime(validFromDate.value);
  const expirationDate = formatDate(validUntilDate.value);
  const expirationTime = formatTime(validUntilDate.value);

  return [
    "Caro(a) professor(a),",
    "",
    `A turma ${groupName} foi liberada no dia ${releaseDate} as ${releaseTime} pelo motivo de ${reason}.`,
    "",
    `A liberacao permanece valida ate ${expirationDate} as ${expirationTime}.`,
    `Solicitado por: ${requesterName}.`,
  ].join("\n");
});

const openRelease = computed(() =>
  releases.value.find((release) => ["pending", "active"].includes(release.status)),
);

const notificationEmailOptions = computed(() =>
  serverUsers.value
    .filter((user) => Boolean(user.email))
    .map((user) => ({
      title: `${user.name} - ${user.email}`,
      value: user.email || "",
    })),
);

function normalizeNotificationEmailEntry(entry: unknown) {
  if (typeof entry === "string") {
    return entry.trim().toLowerCase();
  }

  if (entry && typeof entry === "object") {
    const option = entry as Partial<NotificationEmailOption> & { email?: string };
    return String(option.value || option.email || "").trim().toLowerCase();
  }

  return "";
}

const notificationEmailValues = computed(() => {
  const values = Array.isArray(notificationEmails.value) ? notificationEmails.value : [];
  return Array.from(
    new Set(values.map(normalizeNotificationEmailEntry).filter(Boolean)),
  );
});

const notificationEmailValue = computed(() => notificationEmailValues.value.join(", "));
const hasNotificationEmails = computed(() => notificationEmailValues.value.length > 0);

function getStatusLabel(status: TemporaryGroupRelease["status"]) {
  const labels: Record<TemporaryGroupRelease["status"], string> = {
    pending: "Pendente",
    active: "Ativa",
    consumed: "Utilizada",
    expired: "Expirada",
    cancelled: "Cancelada",
    failed: "Falhou",
  };
  return labels[status];
}

function getStatusColor(status: TemporaryGroupRelease["status"]) {
  const colors: Record<TemporaryGroupRelease["status"], string> = {
    pending: "warning",
    active: "primary",
    consumed: "success",
    expired: "grey",
    cancelled: "default",
    failed: "error",
  };
  return colors[status];
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("pt-BR");
}

function getErrorMessage(error: any, fallback: string) {
  if (error?.response?.data?.non_field_errors?.[0]) {
    return error.response.data.non_field_errors[0];
  }
  if (error?.response?.data?.group_id?.[0]) {
    return error.response.data.group_id[0];
  }
  if (error?.response?.data?.notification_email?.[0]) {
    return error.response.data.notification_email[0];
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  return fallback;
}

async function loadReleases() {
  loading.value = true;
  try {
    const response = await TemporaryGroupReleasesService.getTemporaryGroupReleases({
      group: props.groupId,
      ordering: "-created_at",
      page_size: 20,
    });
    releases.value = response.results;
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao carregar liberações temporárias"));
  } finally {
    loading.value = false;
  }
}

async function loadPortalGroups() {
  try {
    const response = await PortalGroupsService.getPortalGroups({ page_size: 100, is_active: true });
    portalGroups.value = response.results || [];
  } catch (error) {
    console.error("Erro ao carregar grupos de portais:", error);
  }
}

async function loadServerUsers() {
  loadingServerUsers.value = true;
  try {
    const response = await UsersService.getUsers({
      app_role: "servidor",
      ordering: "name",
      page_size: 100,
    });
    serverUsers.value = response.results || [];
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao carregar servidores para notificacao"));
  } finally {
    loadingServerUsers.value = false;
  }
}

const notesRules = [(v: any) => (!!v && v.trim() !== "") || "A observação é obrigatória"];

function restoreGeneratedNotificationMessage() {
  notificationMessageDirty.value = false;
  notificationMessage.value = generatedNotificationMessage.value;
}

function updateNotificationMessage(value: string) {
  notificationMessage.value = value;
  notificationMessageDirty.value = value.trim() !== generatedNotificationMessage.value.trim();
}

async function createRelease() {
  if (durationMinutes.value <= 0) {
    toast.warning("Informe uma duração válida em minutos");
    return;
  }

  if (!validFrom.value) {
    toast.warning("Informe uma data e hora válidas para a liberação");
    return;
  }

  if (notes.value.trim() === "") {
    toast.warning("A observação é obrigatória");
    return;
  }

  saving.value = true;
  try {
    const recipientEmail = notificationEmailValue.value;
    const shouldNotifyServer = recipientEmail !== "";
    const response = await TemporaryGroupReleasesService.createTemporaryGroupRelease({
      group_id: props.groupId,
      duration_minutes: durationMinutes.value,
      notes: notes.value,
      notification_email: recipientEmail || undefined,
      notification_message: shouldNotifyServer
        ? (notificationMessage.value.trim() || generatedNotificationMessage.value)
        : undefined,
      valid_from: new Date(validFrom.value).toISOString(),
      portal_group_id: selectedPortalGroupId.value,
    });
    const releaseResponse = (
      "data" in response && response.data ? response.data : response
    ) as TemporaryGroupRelease;
    notes.value = "";
    validFrom.value = toDateTimeLocalValue();
    selectedPortalGroupId.value = null;
    notificationEmails.value = [];
    restoreGeneratedNotificationMessage();
    toast.success("Liberação temporária criada com sucesso", { autoClose: 3000 });
    if (releaseResponse.notification_warning) {
      toast.warning(releaseResponse.notification_warning, { autoClose: 5000 });
    } else if (shouldNotifyServer && releaseResponse.notification_status === "queued") {
      toast.success("E-mail enfileirado para os destinatarios informados", { autoClose: 3000 });
    } else if (shouldNotifyServer && releaseResponse.notification_status === "sent") {
      toast.success("E-mail enviado para os destinatarios informados", { autoClose: 3000 });
    }
    await loadReleases();
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao criar liberação temporária"));
  } finally {
    saving.value = false;
  }
}

async function cancelRelease(release: TemporaryGroupRelease) {
  cancellingId.value = release.id;
  try {
    await TemporaryGroupReleasesService.cancelTemporaryGroupRelease(release.id);
    toast.success("Liberação temporária cancelada");
    await loadReleases();
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao cancelar liberação temporária"));
  } finally {
    cancellingId.value = null;
  }
}

watch(
  () => props.groupId,
  () => {
    validFrom.value = toDateTimeLocalValue();
    selectedPortalGroupId.value = null;
    notificationEmails.value = [];
    restoreGeneratedNotificationMessage();
    loadReleases();
  },
);

watch(
  generatedNotificationMessage,
  (message) => {
    if (!notificationMessageDirty.value) {
      notificationMessage.value = message;
    }
  },
  { immediate: true },
);

onMounted(() => {
  loadReleases();
  loadPortalGroups();
  loadServerUsers();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-subtitle-1">Nova Liberação</v-card-title>
          <v-card-text>
            <v-alert
              v-if="openRelease?.status === 'active'"
              class="mb-4"
              color="warning"
              icon="mdi-alert-circle"
              variant="tonal"
            >
              Já existe uma liberação em aberto para esta turma com status
              <strong>{{ getStatusLabel(openRelease.status) }}</strong
              >.
            </v-alert>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="durationMinutes"
                  label="Duração (minutos)"
                  min="1"
                  type="number"
                  variant="outlined"
                />
                <v-text-field
                  v-model="validFrom"
                  label="Data e hora da liberação"
                  type="datetime-local"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-textarea
                  v-model="notes"
                  label="Observação"
                  variant="outlined"
                  max-height="136"
                  :rules="notesRules"
                  required
                />
                <v-combobox
                  v-model="notificationEmails"
                  :items="notificationEmailOptions"
                  :loading="loadingServerUsers"
                  chips
                  closable-chips
                  item-title="title"
                  item-value="value"
                  clearable
                  hide-selected
                  label="E-mails para notificar"
                  multiple
                  variant="outlined"
                  persistent-hint
                  no-data-text="Digite um e-mail ou aguarde as sugestoes"
                />
                <v-textarea
                  v-if="hasNotificationEmails"
                  :model-value="notificationMessage"
                  label="Mensagem do e-mail"
                  variant="outlined"
                  rows="4"
                  auto-grow
                  persistent-hint
                  @update:model-value="updateNotificationMessage"
                />
                <div
                  v-if="hasNotificationEmails && notificationMessageDirty"
                  class="mb-4"
                >
                  <v-btn
                    class="px-0"
                    size="small"
                    variant="text"
                    @click="restoreGeneratedNotificationMessage"
                  >
                    Restaurar mensagem automatica
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="!!openRelease || notes.trim() === ''"
              :loading="saving"
              prepend-icon="mdi-account-group-outline"
              @click="createRelease"
            >
              Liberar Turma
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-subtitle-1">Histórico de Liberações</span>
            <v-btn
              color="default"
              prepend-icon="mdi-refresh"
              size="small"
              variant="outlined"
              @click="loadReleases"
            >
              Atualizar
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-progress-linear v-if="loading" color="primary" indeterminate />

            <v-table v-else density="comfortable">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Solicitado por</th>
                  <th>Válida até</th>
                  <th>Resultado</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="release in releases" :key="release.id">
                  <td>
                    <v-chip :color="getStatusColor(release.status)" size="small" variant="tonal">
                      {{ getStatusLabel(release.status) }}
                    </v-chip>
                  </td>
                  <td>
                    <div class="text-body-2">{{ release.requested_by.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDateTime(release.created_at) }}
                    </div>
                  </td>
                  <td>
                    <div class="text-body-2">{{ formatDateTime(release.valid_until) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      Ativada: {{ formatDateTime(release.activated_at) }}
                    </div>
                  </td>
                  <td>
                    <div class="text-body-2">
                      {{ release.result_message || "Aguardando processamento" }}
                    </div>
                    <div v-if="release.consumed_log" class="text-caption text-medium-emphasis">
                      Uso em {{ formatDateTime(release.consumed_log.time) }}
                      <span v-if="release.consumed_log.portal_name">
                        • {{ release.consumed_log.portal_name }}
                      </span>
                      <span v-if="release.consumed_log.device_name">
                        • {{ release.consumed_log.device_name }}
                      </span>
                    </div>
                    <div v-if="release.notes" class="text-caption text-medium-emphasis">
                      Obs.: {{ release.notes }}
                    </div>
                    <div v-if="release.notification_email" class="text-caption text-medium-emphasis">
                      E-mails notificados: {{ release.notification_email }}
                    </div>
                    <div v-if="release.notification_message" class="text-caption text-medium-emphasis">
                      Msg. e-mail: {{ release.notification_message }}
                    </div>
                  </td>
                  <td class="text-right">
                    <v-btn
                      v-if="['pending', 'active'].includes(release.status)"
                      color="error"
                      :loading="cancellingId === release.id"
                      size="small"
                      variant="text"
                      @click="cancelRelease(release)"
                    >
                      Cancelar
                    </v-btn>
                  </td>
                </tr>
                <tr v-if="releases.length === 0">
                  <td class="text-center text-medium-emphasis py-6" colspan="5">
                    Nenhuma liberação temporária registrada.
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
