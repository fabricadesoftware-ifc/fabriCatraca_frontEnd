<script lang="ts" setup>
import type { TemporaryUserRelease } from "@/types";
import { computed, onMounted, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import { TemporaryUserReleasesService } from "@/services";

const props = defineProps<{ userId: number }>();

const releases = ref<TemporaryUserRelease[]>([]);
const loading = ref(false);
const saving = ref(false);
const cancellingId = ref<number | null>(null);
const durationMinutes = ref(5);
const notes = ref("");

function toDateTimeLocalValue(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

const validFrom = ref(toDateTimeLocalValue());

const openRelease = computed(() =>
  releases.value.find((release) => ["pending", "active"].includes(release.status)),
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
    return "—";
  }

  return new Date(value).toLocaleString("pt-BR");
}

function getErrorMessage(error: any, fallback: string) {
  if (error?.response?.data?.non_field_errors?.[0]) {
    return error.response.data.non_field_errors[0];
  }

  if (error?.response?.data?.user_id?.[0]) {
    return error.response.data.user_id[0];
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
    toast.error(getErrorMessage(error, "Erro ao carregar liberações temporárias"));
  } finally {
    loading.value = false;
  }
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

  saving.value = true;
  try {
    await TemporaryUserReleasesService.createTemporaryUserRelease({
      user_id: props.userId,
      duration_minutes: durationMinutes.value,
      notes: notes.value,
      valid_from: new Date(validFrom.value).toISOString(),
    });
    notes.value = "";
    validFrom.value = toDateTimeLocalValue();
    toast.success("Liberação temporária criada com sucesso");
    await loadReleases();
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao criar liberação temporária"));
  } finally {
    saving.value = false;
  }
}

async function cancelRelease(release: TemporaryUserRelease) {
  cancellingId.value = release.id;
  try {
    await TemporaryUserReleasesService.cancelTemporaryUserRelease(release.id);
    toast.success("Liberação temporária cancelada");
    await loadReleases();
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao cancelar liberação temporária"));
  } finally {
    cancellingId.value = null;
  }
}

watch(
  () => props.userId,
  () => {
    validFrom.value = toDateTimeLocalValue();
    loadReleases();
  },
);

onMounted(loadReleases);
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-subtitle-1">Nova Liberação</v-card-title>
          <v-card-text>
            <v-alert
              v-if="openRelease"
              class="mb-4"
              color="warning"
              icon="mdi-alert-circle"
              variant="tonal"
            >
              Já existe uma liberação em aberto para este usuário com status
              <strong>{{ getStatusLabel(openRelease.status) }}</strong>.
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
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="!!openRelease"
              :loading="saving"
              prepend-icon="mdi-lock-open-check"
              @click="createRelease"
            >
              Liberar Usuário
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
