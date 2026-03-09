<script lang="ts" setup>
import type {
  EasySetupDevice,
  EasySetupDeviceResult,
  EasySetupStepResult,
  EasySetupStatusDevice,
} from "@/types";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { useEasySetupStore } from "@/stores";

const store = useEasySetupStore();

// Estado local
const selectedIds = ref<number[]>([]);
const confirmDialog = ref(false);
const showResults = ref(false);
const activeTab = ref("setup");

// Computed
const selectedCount = computed(() => selectedIds.value.length);
const allSelected = computed(() => selectedIds.value.length === store.devices.length);
const someSelected = computed(() => selectedIds.value.length > 0 && !allSelected.value);

const isFinished = computed(() =>
  ["success", "partial", "failed"].includes(store.overallStatus || ""),
);

const progressPercent = computed(() => {
  if (store.totalCount === 0) return 0;
  return Math.round((store.completedCount / store.totalCount) * 100);
});

const overallStatusColor = computed(() => {
  const colors: Record<string, string> = {
    pending: "grey",
    running: "primary",
    success: "success",
    partial: "warning",
    failed: "error",
  };
  return colors[store.overallStatus || ""] || "grey";
});

const overallStatusLabel = computed(() => {
  const labels: Record<string, string> = {
    pending: "Aguardando",
    running: "Executando",
    success: "Concluído com sucesso",
    partial: "Parcialmente concluído",
    failed: "Falhou",
  };
  return labels[store.overallStatus || ""] || "Desconhecido";
});

// Métodos
function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = store.devices.map((d) => d.id);
  }
}

function toggleDevice(id: number) {
  const idx = selectedIds.value.indexOf(id);
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(id);
  }
}

function openConfirmDialog() {
  if (selectedCount.value === 0) {
    toast.warning("Selecione pelo menos uma catraca");
    return;
  }
  confirmDialog.value = true;
}

async function executeSetup() {
  confirmDialog.value = false;
  showResults.value = true;
  try {
    await store.executeSetup(selectedIds.value);
    toast.info(store.taskResponse?.message || "Easy Setup iniciado");
  } catch {
    toast.error(store.error || "Erro ao iniciar Easy Setup");
    showResults.value = false;
  }
}

function getDeviceStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: "mdi-clock-outline",
    running: "mdi-loading mdi-spin",
    success: "mdi-check-circle",
    partial: "mdi-alert-circle",
    failed: "mdi-close-circle",
  };
  return icons[status] || "mdi-help-circle";
}

function getDeviceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "grey",
    running: "primary",
    success: "success",
    partial: "warning",
    failed: "error",
  };
  return colors[status] || "grey";
}

function getDeviceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Aguardando",
    running: "Executando...",
    success: "Sucesso",
    partial: "Parcial",
    failed: "Falhou",
  };
  return labels[status] || status;
}

// Helpers para resultados detalhados (report)
function getStepIcon(step: EasySetupStepResult): string {
  if (step.skipped) return "mdi-skip-next-circle";
  return step.ok ? "mdi-check-circle" : "mdi-close-circle";
}

function getStepColor(step: EasySetupStepResult): string {
  if (step.skipped) return "grey";
  return step.ok ? "success" : "error";
}

function getPushEntries(push: Record<string, EasySetupStepResult>) {
  const items: Array<EasySetupStepResult & { name: string }> = [];
  const preferredKeys = [
    "users",
    "user_roles",
    "pins",
    "time_zones",
    "time_spans",
    "access_rules",
    "groups",
    "areas",
    "portals",
    "user_groups",
    "user_access_rules",
    "group_access_rules",
    "access_rule_time_zones",
    "portal_access_rules",
    "cards",
    "templates",
  ];
  const keys = [
    ...preferredKeys.filter((key) => key in push),
    ...Object.keys(push).filter(
      (key) => !preferredKeys.includes(key) && !key.startsWith("_"),
    ),
  ];
  for (const key of keys) {
    if (push[key]) {
      items.push({ name: formatPushName(key), ...push[key] });
    }
  }
  return items;
}

function formatPushName(key: string): string {
  const names: Record<string, string> = {
    users: "Usuarios",
    user_roles: "Perfis Administrativos",
    pins: "PINs",
    groups: "Grupos",
    time_zones: "Zonas de Tempo",
    time_spans: "Intervalos de Tempo",
    access_rules: "Regras de Acesso",
    areas: "Areas",
    portals: "Portais",
    user_groups: "Grupos de Usuarios",
    user_access_rules: "Regras por Usuario",
    group_access_rules: "Regras por Grupo",
    access_rule_time_zones: "Horarios das Regras",
    portal_access_rules: "Regras por Portal",
    cards: "Cartoes",
    templates: "Templates Biometricos",
  };
  return names[key] || key;
}

function getCleanEntries(clean: Record<string, EasySetupStepResult>) {
  const items: Array<EasySetupStepResult & { name: string }> = [];
  const keys = ["access_logs", "users", "groups"];
  for (const key of keys) {
    if (clean[key]) {
      items.push({ name: formatCleanName(key), ...clean[key] });
    }
  }
  return items;
}

function formatCleanName(key: string): string {
  const names: Record<string, string> = {
    access_logs: "Logs de Acesso",
    users: "Usuários",
    groups: "Grupos",
  };
  return names[key] || key;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const min = Math.floor(seconds / 60);
  const sec = (seconds % 60).toFixed(1);
  return `${min}m ${sec}s`;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR");
}

function getHistoryStatusColor(status: string): string {
  return getDeviceStatusColor(status);
}

async function reload() {
  showResults.value = false;
  store.reset();
  await loadDevices();
}

async function loadDevices() {
  try {
    await store.loadDevices();
    selectedIds.value = store.devices.filter((d) => d.selected).map((d) => d.id);
  } catch {
    toast.error("Erro ao carregar dispositivos");
  }
}

onMounted(loadDevices);

onUnmounted(() => {
  store.stopPolling();
});
</script>

<template>
  <v-container fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Easy Setup</h2>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Reset e reconfiguração automática de catracas
        </p>
      </div>
      <div class="d-flex ga-2">
        <v-btn
          color="default"
          :disabled="store.executing"
          prepend-icon="mdi-history"
          variant="outlined"
          @click="
            activeTab = activeTab === 'history' ? 'setup' : 'history';
            activeTab === 'history' && store.loadHistory();
          "
        >
          {{ activeTab === "history" ? "Voltar" : "Histórico" }}
        </v-btn>
        <v-btn
          color="default"
          :disabled="store.executing"
          prepend-icon="mdi-refresh"
          variant="outlined"
          @click="reload"
        >
          Recarregar
        </v-btn>
        <v-btn
          v-if="activeTab === 'setup'"
          color="error"
          :disabled="selectedCount === 0 || store.executing"
          :loading="store.executing"
          prepend-icon="mdi-cog-sync"
          @click="openConfirmDialog"
        >
          Executar Easy Setup
        </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <v-progress-linear v-if="store.loading" color="primary" indeterminate class="mb-4" />

    <!-- Erro ao carregar -->
    <v-alert
      v-if="store.error && !store.executing && !showResults"
      class="mb-4"
      closable
      color="error"
      icon="mdi-alert-circle"
      variant="tonal"
    >
      {{ store.error }}
    </v-alert>

    <!-- ==================== ABA HISTÓRICO ==================== -->
    <template v-if="activeTab === 'history'">
      <v-progress-linear v-if="store.loadingHistory" color="primary" indeterminate class="mb-4" />
      <v-card
        v-if="!store.loadingHistory && store.history.length === 0"
        class="pa-8 text-center"
        elevation="1"
        rounded="lg"
      >
        <v-icon class="mb-4" color="grey" icon="mdi-history" size="64" />
        <div class="text-h6 text-grey">Nenhuma execução encontrada</div>
      </v-card>
      <v-card v-else-if="!store.loadingHistory" elevation="2" rounded="lg">
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Status</th>
              <th class="text-center">Devices</th>
              <th>Iniciado</th>
              <th>Finalizado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in store.history" :key="entry.task_id">
              <td class="text-caption font-weight-medium">{{ entry.task_id.slice(0, 8) }}...</td>
              <td>
                <v-chip :color="getHistoryStatusColor(entry.status)" size="small" variant="tonal">
                  {{ entry.status }}
                </v-chip>
              </td>
              <td class="text-center">{{ entry.device_count }}</td>
              <td>{{ formatDateTime(entry.started_at) }}</td>
              <td>{{ entry.finished_at ? formatDateTime(entry.finished_at) : "—" }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>

    <!-- ==================== ABA SETUP ==================== -->
    <template v-if="activeTab === 'setup'">
      <!-- Progresso em tempo real -->
      <template v-if="showResults">
        <!-- Barra de progresso geral -->
        <v-card class="mb-6 pa-6" elevation="2" rounded="lg">
          <div class="d-flex align-center ga-3 mb-4">
            <v-icon
              :color="overallStatusColor"
              :icon="store.executing ? 'mdi-cog-sync' : 'mdi-check-circle'"
              size="32"
              :class="{ 'mdi-spin': store.executing }"
            />
            <div class="flex-grow-1">
              <div class="text-h6">{{ overallStatusLabel }}</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ store.completedCount }}/{{ store.totalCount }} dispositivo(s) processado(s)
              </div>
            </div>
            <v-chip :color="overallStatusColor" size="small" variant="tonal">
              {{ progressPercent }}%
            </v-chip>
          </div>
          <v-progress-linear
            :color="overallStatusColor"
            height="8"
            :indeterminate="store.overallStatus === 'running' && store.completedCount === 0"
            :model-value="progressPercent"
            rounded
          />
          <div v-if="store.taskId" class="text-caption text-medium-emphasis mt-2">
            Task ID: {{ store.taskId }}
          </div>
        </v-card>

        <!-- Status por device -->
        <v-card
          v-for="(dev, idx) in store.statusDevices"
          :key="idx"
          class="mb-4"
          elevation="2"
          rounded="lg"
        >
          <v-card-title class="d-flex align-center ga-3">
            <v-icon
              :color="getDeviceStatusColor(dev.status)"
              :icon="getDeviceStatusIcon(dev.status)"
              size="28"
            />
            <span>{{ dev.device_name }}</span>
            <v-spacer />
            <v-chip :color="getDeviceStatusColor(dev.status)" size="small" variant="tonal">
              {{ getDeviceStatusLabel(dev.status) }}
            </v-chip>
            <v-chip v-if="dev.report?.elapsed_s" color="info" size="small" variant="tonal">
              <v-icon icon="mdi-timer" size="14" start />
              {{ formatElapsed(dev.report.elapsed_s) }}
            </v-chip>
          </v-card-title>

          <!-- Detalhes se report disponível -->
          <v-card-text v-if="dev.report">
            <v-chip
              class="mb-3 mr-2"
              :color="dev.report.summary.tables_with_errors === 0 ? 'success' : 'error'"
              size="small"
              variant="tonal"
            >
              {{ dev.report.summary.records_pushed }} registros enviados,
              {{ dev.report.summary.tables_with_errors }} erros
            </v-chip>

            <v-expansion-panels variant="accordion">
              <!-- Login -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon
                    :color="getStepColor(dev.report.steps.login)"
                    :icon="getStepIcon(dev.report.steps.login)"
                    class="mr-2"
                  />
                  Login
                  <template v-if="!dev.report.steps.login.ok">
                    <v-chip class="ml-2" color="error" size="x-small" variant="flat">Falha</v-chip>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-alert
                    :color="dev.report.steps.login.ok ? 'success' : 'error'"
                    density="compact"
                    variant="tonal"
                  >
                    {{
                      dev.report.steps.login.ok
                        ? "Login realizado com sucesso"
                        : "Falha no login — dispositivo inacessível"
                    }}
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Clean -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="mr-2" color="info" icon="mdi-broom" />
                  Limpeza de Dados
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Tabela</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="entry in getCleanEntries(dev.report.steps.clean)"
                        :key="entry.name"
                      >
                        <td>{{ entry.name }}</td>
                        <td>
                          <v-icon
                            :color="getStepColor(entry)"
                            :icon="getStepIcon(entry)"
                            size="20"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Datetime -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon
                    :color="getStepColor(dev.report.steps.datetime)"
                    :icon="getStepIcon(dev.report.steps.datetime)"
                    class="mr-2"
                  />
                  Data/Hora
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-alert
                    :color="dev.report.steps.datetime.ok ? 'success' : 'error'"
                    density="compact"
                    variant="tonal"
                  >
                    {{
                      dev.report.steps.datetime.ok
                        ? `Hora sincronizada: ${dev.report.steps.datetime.datetime}`
                        : "Erro ao sincronizar data/hora"
                    }}
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Monitor -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon
                    :color="getStepColor(dev.report.steps.monitor)"
                    :icon="getStepIcon(dev.report.steps.monitor)"
                    class="mr-2"
                  />
                  Monitor Push
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-alert
                    :color="dev.report.steps.monitor.ok ? 'success' : 'error'"
                    density="compact"
                    variant="tonal"
                  >
                    <template v-if="dev.report.steps.monitor.ok">
                      Monitor configurado: <code>{{ dev.report.steps.monitor.full_url }}</code>
                    </template>
                    <template v-else>Erro ao configurar monitor</template>
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Push -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="mr-2" color="primary" icon="mdi-upload" />
                  Push de Dados
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Tabela</th>
                        <th class="text-center">Quantidade</th>
                        <th class="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="entry in getPushEntries(dev.report.steps.push)" :key="entry.name">
                        <td>{{ entry.name }}</td>
                        <td class="text-center">
                          <template v-if="entry.skipped">
                            <v-chip color="grey" size="x-small" variant="tonal">Ignorado</v-chip>
                          </template>
                          <template v-else>{{ entry.count ?? "—" }}</template>
                        </td>
                        <td class="text-center">
                          <v-icon
                            :color="getStepColor(entry)"
                            :icon="getStepIcon(entry)"
                            size="20"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>

          <!-- Progresso inline se ainda não terminou -->
          <v-card-text v-else-if="dev.status === 'running'">
            <v-progress-linear color="primary" indeterminate rounded height="4" />
            <div class="text-caption text-medium-emphasis mt-2">Processando dispositivo...</div>
          </v-card-text>
        </v-card>

        <!-- Botão para voltar à seleção -->
        <div v-if="isFinished" class="text-center mt-4">
          <v-btn color="primary" prepend-icon="mdi-arrow-left" variant="outlined" @click="reload">
            Voltar à Seleção
          </v-btn>
        </div>
      </template>

      <!-- Lista de Catracas (seleção) -->
      <template v-if="!store.executing && !showResults && !store.loading">
        <!-- Selecionar todos -->
        <v-card class="mb-4" elevation="1" rounded="lg">
          <v-card-text class="d-flex align-center pa-4">
            <v-checkbox
              class="mr-2"
              color="primary"
              hide-details
              :indeterminate="someSelected"
              :model-value="allSelected"
              @update:model-value="toggleAll"
            />
            <span class="text-body-1 font-weight-medium">
              Selecionar Todas ({{ selectedCount }}/{{ store.devices.length }})
            </span>
          </v-card-text>
        </v-card>

        <!-- Cards de devices -->
        <v-row>
          <v-col v-for="device in store.devices" :key="device.id" cols="12" md="6" lg="4">
            <v-card
              class="h-100 device-card"
              :class="{ 'border-primary': selectedIds.includes(device.id) }"
              elevation="2"
              rounded="lg"
              @click="toggleDevice(device.id)"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-3">
                  <v-checkbox
                    color="primary"
                    hide-details
                    :model-value="selectedIds.includes(device.id)"
                    @click.stop
                    @update:model-value="toggleDevice(device.id)"
                  />
                  <div class="ml-2 flex-grow-1">
                    <div class="d-flex align-center ga-2">
                      <span class="text-subtitle-1 font-weight-bold">{{ device.name }}</span>
                      <v-chip
                        v-if="device.is_default"
                        color="primary"
                        size="x-small"
                        variant="flat"
                      >
                        Padrão
                      </v-chip>
                    </div>
                    <div class="text-caption text-medium-emphasis">{{ device.ip }}</div>
                  </div>
                </div>

                <v-divider class="mb-3" />

                <div class="d-flex flex-column ga-2">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2 text-medium-emphasis">
                      <v-icon icon="mdi-account-group" size="16" class="mr-1" />
                      Usuarios globais
                    </span>
                    <v-chip color="info" size="small" variant="tonal">
                      {{ device.user_count }}
                    </v-chip>
                  </div>

                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2 text-medium-emphasis">
                      <v-icon icon="mdi-broadcast" size="16" class="mr-1" />
                      Monitor
                    </span>
                    <v-chip
                      :color="device.monitor_configured ? 'success' : 'error'"
                      size="small"
                      variant="tonal"
                    >
                      <v-icon
                        :icon="device.monitor_configured ? 'mdi-check-circle' : 'mdi-close-circle'"
                        size="14"
                        start
                      />
                      {{ device.monitor_configured ? "Disponivel" : "Nao configurado" }}
                    </v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Vazio -->
        <v-card
          v-if="store.devices.length === 0 && !store.loading"
          class="pa-8 text-center"
          elevation="1"
          rounded="lg"
        >
          <v-icon class="mb-4" color="grey" icon="mdi-turnstile" size="64" />
          <div class="text-h6 text-grey">Nenhuma catraca encontrada</div>
          <div class="text-body-2 text-medium-emphasis">
            Verifique se há dispositivos ativos cadastrados no sistema.
          </div>
        </v-card>
      </template>
    </template>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="550" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6 d-flex align-center ga-2 bg-error pa-4">
          <v-icon color="white" icon="mdi-alert" />
          <span class="text-white">Confirmar Easy Setup</span>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert
            border="start"
            color="error"
            density="compact"
            icon="mdi-alert-octagon"
            variant="tonal"
            class="mb-4"
          >
            <strong>ATENÇÃO:</strong> Esta operação é <strong>destrutiva e irreversível</strong>.
          </v-alert>

          <p class="text-body-1 mb-4">
            Esta operação vai
            <strong>RESETAR completamente {{ selectedCount }} catraca(s)</strong> selecionada(s),
            apagando <strong>todos os dados internos</strong> e reconfigurando do zero.
          </p>

          <p class="text-body-2 text-medium-emphasis mb-2">Catracas selecionadas:</p>
          <v-chip
            v-for="id in selectedIds"
            :key="id"
            class="ma-1"
            color="error"
            size="small"
            variant="tonal"
          >
            {{ store.devices.find((d) => d.id === id)?.name || `ID ${id}` }}
          </v-chip>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false"> Cancelar </v-btn>
          <v-btn color="error" prepend-icon="mdi-cog-sync" variant="flat" @click="executeSetup">
            Confirmar Reset
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.device-card {
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.device-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}
.border-primary {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
</style>
