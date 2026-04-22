<script lang="ts" setup>
import type { TemporaryUserRelease, User, Visita } from "@/types";
import { computed, onMounted, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import {
  PortalGroupsService,
  TemporaryUserReleasesService,
  UsersService,
  VisitasService,
} from "@/services";

const props = defineProps<{ userId: number }>();

const releases = ref<TemporaryUserRelease[]>([]);
const serverUsers = ref<User[]>([]);
const visitas = ref<Visita[]>([]);
const loading = ref(false);
const loadingServerUsers = ref(false);
const loadingVisitas = ref(false);
const saving = ref(false);
const cancellingId = ref<number | null>(null);
const durationMinutes = ref(5);
const notes = ref("");
const selectedPortalGroupId = ref<number | null>(null);
const selectedVisitaId = ref<number | null>(null);
const selectedNotifiedServerId = ref<number | null>(null);
const portalGroups = ref<any[]>([]);

function toDateTimeLocalValue(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

const validFrom = ref(toDateTimeLocalValue());

const openRelease = computed(() =>
  releases.value.find((release) => ["pending", "active"].includes(release.status)),
);

const visitaOptions = computed(() =>
  visitas.value.map((visita) => ({
    title: buildVisitaLabel(visita),
    value: visita.id,
  })),
);

const notifiedServerOptions = computed(() =>
  serverUsers.value
    .filter((user) => Boolean(user.email))
    .map((user) => ({
      title: user.name,
      value: user.id,
      subtitle: user.email || "",
    })),
);

function getStatusLabel(status: TemporaryUserRelease["status"]) {
  const labels: Record<TemporaryUserRelease["status"], string> = {
    pending: "Pendente",
    active: "Ativa",
    consumed: "Utilizada",
    expired: "Expirada",
    cancelled: "Cancelada",
    failed: "Falhou",
  };
  return labels[status];
}

function getStatusColor(status: TemporaryUserRelease["status"]) {
  const colors: Record<TemporaryUserRelease["status"], string> = {
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
    return "-";
  }

  return new Date(value).toLocaleString("pt-BR");
}

function buildVisitaLabel(visita: Visita) {
  const parts = [`Visita #${visita.id}`, `Entrada: ${formatDateTime(visita.visit_date)}`];

  if (visita.end_date) {
    parts.push(`Saida prevista: ${formatDateTime(visita.end_date)}`);
  }

  return parts.join(" • ");
}

function getErrorMessage(error: any, fallback: string) {
  if (error?.response?.data?.non_field_errors?.[0]) {
    return error.response.data.non_field_errors[0];
  }

  if (error?.response?.data?.user_id?.[0]) {
    return error.response.data.user_id[0];
  }

  if (error?.response?.data?.visita_id?.[0]) {
    return error.response.data.visita_id[0];
  }

  if (error?.response?.data?.notified_server_id?.[0]) {
    return error.response.data.notified_server_id[0];
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  return fallback;
}

async function loadReleases() {
  loading.value = true;
  try {
    const response = await TemporaryUserReleasesService.getTemporaryUserReleases({
      user: props.userId,
      ordering: "-created_at",
      page_size: 20,
    });
    releases.value = response.results;
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao carregar liberacoes temporarias"));
  } finally {
    loading.value = false;
  }
}

async function loadPortalGroups() {
  try {
    const response = await PortalGroupsService.getPortalGroups({
      page_size: 100,
      is_active: true,
    });
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

async function loadVisitas() {
  loadingVisitas.value = true;
  try {
    const response = await VisitasService.getVisitas({
      user: props.userId,
      ordering: "-visit_date",
      page_size: 50,
    });
    visitas.value = response.results || [];
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao carregar visitas do usuario"));
  } finally {
    loadingVisitas.value = false;
  }
}

const notesRules = [(v: any) => (!!v && v.trim() !== "") || "A observacao e obrigatoria"];

async function createRelease() {
  if (durationMinutes.value <= 0) {
    toast.warning("Informe uma duracao valida em minutos");
    return;
  }

  if (!validFrom.value) {
    toast.warning("Informe uma data e hora validas para a liberacao");
    return;
  }

  if (notes.value.trim() === "") {
    toast.warning("A observacao e obrigatoria");
    return;
  }

  saving.value = true;
  try {
    const shouldNotifyServer = selectedNotifiedServerId.value !== null;
    const response = await TemporaryUserReleasesService.createTemporaryUserRelease({
      user_id: props.userId,
      duration_minutes: durationMinutes.value,
      notes: notes.value,
      valid_from: new Date(validFrom.value).toISOString(),
      portal_group_id: selectedPortalGroupId.value,
      visita_id: selectedVisitaId.value,
      notified_server_id: selectedNotifiedServerId.value,
    });
    const releaseResponse = (
      "data" in response && response.data ? response.data : response
    ) as TemporaryUserRelease;
    notes.value = "";
    validFrom.value = toDateTimeLocalValue();
    selectedPortalGroupId.value = null;
    selectedVisitaId.value = null;
    selectedNotifiedServerId.value = null;
    toast.success("Liberacao temporaria criada com sucesso", { autoClose: 3000 });
    if (releaseResponse.notification_warning) {
      toast.warning(releaseResponse.notification_warning, { autoClose: 5000 });
    } else if (shouldNotifyServer && releaseResponse.notification_status === "queued") {
      toast.success("E-mail enfileirado para o servidor selecionado", { autoClose: 3000 });
    } else if (shouldNotifyServer && releaseResponse.notification_status === "sent") {
      toast.success("E-mail enviado para o servidor selecionado", { autoClose: 3000 });
    }
    await loadReleases();
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao criar liberacao temporaria"));
  } finally {
    saving.value = false;
  }
}

async function cancelRelease(release: TemporaryUserRelease) {
  cancellingId.value = release.id;
  try {
    await TemporaryUserReleasesService.cancelTemporaryUserRelease(release.id);
    toast.success("Liberacao temporaria cancelada");
    await loadReleases();
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao cancelar liberacao temporaria"));
  } finally {
    cancellingId.value = null;
  }
}

watch(
  () => props.userId,
  () => {
    validFrom.value = toDateTimeLocalValue();
    selectedPortalGroupId.value = null;
    selectedVisitaId.value = null;
    selectedNotifiedServerId.value = null;
    loadReleases();
    loadVisitas();
  },
);

onMounted(() => {
  loadReleases();
  loadPortalGroups();
  loadServerUsers();
  loadVisitas();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-subtitle-1">Nova Liberacao</v-card-title>
          <v-card-text>
            <v-alert
              v-if="openRelease?.status === 'active'"
              class="mb-4"
              color="warning"
              icon="mdi-alert-circle"
              variant="tonal"
            >
              Ja existe uma liberacao em aberto para este usuario com status
              <strong>{{ getStatusLabel(openRelease.status) }}</strong
              >.
            </v-alert>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="durationMinutes"
                  label="Duracao (minutos)"
                  min="1"
                  type="number"
                  variant="outlined"
                />
                <v-text-field
                  v-model="validFrom"
                  label="Data e hora da liberacao"
                  type="datetime-local"
                  variant="outlined"
                />
                <v-select
                  v-model="selectedPortalGroupId"
                  :items="portalGroups"
                  item-title="name"
                  item-value="id"
                  label="Grupo de Portais"
                  clearable
                  variant="outlined"
                  hint="Selecione o grupo de catracas onde a liberacao sera aplicada"
                  persistent-hint
                >
                  <template #prepend-item>
                    <v-list-item
                      density="compact"
                      title="Todas as catracas"
                      @click="selectedPortalGroupId = null"
                    />
                    <v-divider class="my-2" />
                  </template>
                </v-select>
                <v-select
                  v-model="selectedVisitaId"
                  :items="visitaOptions"
                  :loading="loadingVisitas"
                  clearable
                  label="Visita vinculada"
                  variant="outlined"
                  hint="Opcional: vincule esta liberacao a uma visita existente"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-textarea
                  v-model="notes"
                  label="Observacao"
                  variant="outlined"
                  max-height="136"
                  :rules="notesRules"
                  required
                />
                <v-select
                  v-model="selectedNotifiedServerId"
                  :items="notifiedServerOptions"
                  :loading="loadingServerUsers"
                  item-title="title"
                  item-value="value"
                  clearable
                  label="Servidor para notificar"
                  variant="outlined"
                  hint="Opcional: selecione o servidor/professor que deve receber o e-mail desta liberacao"
                  persistent-hint
                  no-data-text="Nenhum servidor com e-mail encontrado"
                />
                <v-alert
                  v-if="visitas.length > 0"
                  class="mt-2"
                  color="info"
                  icon="mdi-link-variant"
                  variant="tonal"
                >
                  Agora a liberacao pode ficar ligada a uma visita especifica do usuario. Isso ajuda
                  a enxergar no sistema qual visita esta sendo tratada.
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="!!openRelease || notes.trim() === ''"
              :loading="saving"
              prepend-icon="mdi-lock-open-check"
              @click="createRelease"
            >
              Liberar Usuario
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-subtitle-1">Historico de Liberacoes</span>
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
                  <th>Valida ate</th>
                  <th>Resultado</th>
                  <th class="text-right">Acoes</th>
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
                    <div v-if="release.notified_server" class="text-caption text-medium-emphasis">
                      Servidor notificado: {{ release.notified_server.name }}
                    </div>
                    <div v-if="release.visita" class="text-caption text-medium-emphasis">
                      Visita vinculada: {{ buildVisitaLabel(release.visita) }}
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
                    Nenhuma liberacao temporaria registrada.
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
