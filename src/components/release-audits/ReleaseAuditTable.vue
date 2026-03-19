<script setup lang="ts">
import type { QueryParams, ReleaseAudit } from "@/types";
import { computed, onMounted, ref, watch } from "vue";
import { ReleaseAuditsService } from "@/services";

const props = defineProps<{
  title?: string;
  filters?: QueryParams;
  releaseTypes?: string[];
}>();

const loading = ref(false);
const audits = ref<ReleaseAudit[]>([]);

const filteredAudits = computed(() => {
  if (!props.releaseTypes?.length) {
    return audits.value;
  }
  return audits.value.filter(audit => props.releaseTypes?.includes(audit.release_type));
});

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("pt-BR");
}

function releaseTypeLabel(value: string) {
  if (value === "device_event") return "Evento";
  if (value === "single_turn") return "Giro único";
  if (value === "scheduled_user_release") return "Agendada";
  if (value === "temporary_user_release") return "Temporária";
  return value;
}

function statusColor(value: string) {
  if (value === "consumed" || value === "sent") return "success";
  if (value === "active") return "primary";
  if (value === "requested") return "warning";
  if (value === "failed") return "error";
  if (value === "cancelled") return "default";
  return "grey";
}

function statusLabel(value: string) {
  if (value === "requested") return "Solicitada";
  if (value === "sent") return "Enviada";
  if (value === "active") return "Ativa";
  if (value === "consumed") return "Consumida";
  if (value === "expired") return "Expirada";
  if (value === "cancelled") return "Cancelada";
  if (value === "failed") return "Falhou";
  return value;
}

async function loadAudits() {
  loading.value = true;
  try {
    const response = await ReleaseAuditsService.getReleaseAudits({
      ordering: "-requested_at",
      page_size: 50,
      ...props.filters,
    });
    audits.value = response.results;
  } catch (error) {
    console.error(error);
    audits.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.filters,
  () => {
    loadAudits();
  },
  { deep: true },
);

onMounted(loadAudits);
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ title || "Histórico de Liberações" }}</span>
      <v-btn
        color="default"
        prepend-icon="mdi-refresh"
        size="small"
        variant="outlined"
        @click="loadAudits"
      >
        Atualizar
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-progress-linear v-if="loading" color="primary" indeterminate />

      <v-table v-else density="comfortable">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Status</th>
            <th>Solicitado por</th>
            <th>Alvo</th>
            <th>Catraca</th>
            <th>Datas</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="audit in filteredAudits" :key="audit.id">
            <td>{{ releaseTypeLabel(audit.release_type) }}</td>
            <td>
              <v-chip :color="statusColor(audit.status)" size="small" variant="tonal">
                {{ statusLabel(audit.status) }}
              </v-chip>
            </td>
            <td>
              <div class="text-body-2">{{ audit.requested_by_data?.name || audit.requested_by_name }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ audit.requested_by_data?.role || audit.requested_by_role || "—" }}
              </div>
            </td>
            <td>
              <div class="text-body-2">{{ audit.target_user_data?.name || audit.target_user_name || "—" }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ audit.target_user_data?.registration || audit.target_user_registration || "—" }}
              </div>
            </td>
            <td>
              <div class="text-body-2">{{ audit.device_name || "—" }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ audit.portal_name || "—" }}
              </div>
            </td>
            <td>
              <div class="text-body-2">Solicitada: {{ formatDateTime(audit.requested_at) }}</div>
              <div class="text-caption text-medium-emphasis">
                Agendada: {{ formatDateTime(audit.scheduled_for) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Encerrada: {{ formatDateTime(audit.closed_at) }}
              </div>
            </td>
            <td>
              <div class="text-body-2">{{ audit.error_message || "Sem erros" }}</div>
              <div v-if="audit.notes" class="text-caption text-medium-emphasis">
                Motivo: {{ audit.notes }}
              </div>
            </td>
          </tr>
          <tr v-if="filteredAudits.length === 0">
            <td class="text-center py-6 text-medium-emphasis" colspan="7">
              Nenhuma auditoria de liberação encontrada.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
