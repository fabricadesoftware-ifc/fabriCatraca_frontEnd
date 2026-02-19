<script lang="ts" setup>
import type { EasySetupDevice, EasySetupDeviceResult, EasySetupStepResult } from "@/types";
import { computed, onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { useEasySetupStore } from "@/stores";

const store = useEasySetupStore();

// Estado local
const selectedIds = ref<number[]>([]);
const confirmDialog = ref(false);
const showResults = ref(false);
const expandedResults = ref<number[]>([]);

// Computed
const selectedCount = computed(() => selectedIds.value.length);
const allSelected = computed(() => selectedIds.value.length === store.devices.length);
const someSelected = computed(() => selectedIds.value.length > 0 && !allSelected.value);

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
  showResults.value = false;
  try {
    await store.executeSetup(selectedIds.value);
    showResults.value = true;
    if (store.response?.success) {
      toast.success(store.response.message);
    } else {
      toast.warning("Easy Setup concluído com erros");
    }
  } catch {
    toast.error(store.error || "Erro ao executar Easy Setup");
  }
}

function getStepIcon(step: EasySetupStepResult): string {
  if (step.skipped) return "mdi-skip-next-circle";
  return step.ok ? "mdi-check-circle" : "mdi-close-circle";
}

function getStepColor(step: EasySetupStepResult): string {
  if (step.skipped) return "grey";
  return step.ok ? "success" : "error";
}

function getDeviceResultIcon(result: EasySetupDeviceResult): string {
  return result.summary.tables_with_errors === 0 ? "mdi-check-circle" : "mdi-alert-circle";
}

function getDeviceResultColor(result: EasySetupDeviceResult): string {
  return result.summary.tables_with_errors === 0 ? "success" : "error";
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const min = Math.floor(seconds / 60);
  const sec = (seconds % 60).toFixed(1);
  return `${min}m ${sec}s`;
}

function getPushEntries(push: Record<string, EasySetupStepResult>) {
  const items: Array<EasySetupStepResult & { name: string }> = [];
  const keys = [
    "users",
    "pins",
    "groups",
    "time_zones",
    "time_spans",
    "access_rules",
    "areas",
    "portals",
    "user_groups",
    "cards",
    "templates",
  ];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (push[key]) {
      items.push({ name: formatPushName(key), ...push[key] });
    }
  }
  return items;
}

function formatPushName(key: string): string {
  const names: Record<string, string> = {
    users: "Usuários",
    pins: "PINs",
    groups: "Grupos",
    time_zones: "Zonas de Tempo",
    time_spans: "Intervalos de Tempo",
    access_rules: "Regras de Acesso",
    areas: "Áreas",
    portals: "Portais",
    user_groups: "Grupos de Usuários",
    cards: "Cartões",
    templates: "Templates Biométricos",
  };
  return names[key] || key;
}

function getCleanEntries(clean: Record<string, EasySetupStepResult>) {
  const items: Array<EasySetupStepResult & { name: string }> = [];
  const keys = ["access_logs", "users", "groups"];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
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

async function reload() {
  showResults.value = false;
  store.reset();
  await loadDevices();
}

async function loadDevices() {
  try {
    await store.loadDevices();
    // Selecionar todos por padrão
    selectedIds.value = store.devices.filter((d) => d.selected).map((d) => d.id);
  } catch {
    toast.error("Erro ao carregar dispositivos");
  }
}

onMounted(loadDevices);
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
          prepend-icon="mdi-refresh"
          variant="outlined"
          @click="reload"
        >
          Recarregar
        </v-btn>
        <v-btn
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

    <!-- Executing overlay -->
    <v-card v-if="store.executing" class="mb-6 pa-8 text-center" elevation="2" rounded="lg">
      <v-progress-circular class="mb-4" color="primary" indeterminate size="64" width="5" />
      <div class="text-h6 mb-2">Executando Easy Setup...</div>
      <div class="text-body-2 text-medium-emphasis">
        Isso pode levar alguns minutos. Não feche esta página.
      </div>
      <div class="text-caption text-medium-emphasis mt-2">
        Resetando e reconfigurando {{ selectedCount }} catraca(s)...
      </div>
    </v-card>

    <!-- Resultados -->
    <template v-if="showResults && store.response">
      <!-- Resumo geral -->
      <v-alert
        class="mb-4"
        :color="store.response.devices_ok === store.response.devices_total ? 'success' : 'warning'"
        :icon="
          store.response.devices_ok === store.response.devices_total
            ? 'mdi-check-circle'
            : 'mdi-alert'
        "
        prominent
        variant="tonal"
      >
        <div class="text-h6">
          {{ store.response.devices_ok }}/{{ store.response.devices_total }} catracas configuradas
          com sucesso
        </div>
        <div class="text-body-2">{{ store.response.message }}</div>
      </v-alert>

      <!-- Cards de resultado por device -->
      <v-card
        v-for="(result, idx) in store.results"
        :key="idx"
        class="mb-4"
        elevation="2"
        rounded="lg"
      >
        <v-card-title class="d-flex align-center ga-3">
          <v-icon
            :color="getDeviceResultColor(result)"
            :icon="getDeviceResultIcon(result)"
            size="28"
          />
          <span>{{ result.device }}</span>
          <v-spacer />
          <v-chip color="info" size="small" variant="tonal">
            <v-icon icon="mdi-timer" size="14" start />
            {{ formatElapsed(result.elapsed_s) }}
          </v-chip>
          <v-chip
            :color="result.summary.tables_with_errors === 0 ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ result.summary.records_pushed }} registros enviados,
            {{ result.summary.tables_with_errors }} erros
          </v-chip>
        </v-card-title>

        <v-card-text>
          <v-expansion-panels variant="accordion">
            <!-- Login -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon
                  :color="getStepColor(result.steps.login)"
                  :icon="getStepIcon(result.steps.login)"
                  class="mr-2"
                />
                Login
                <template v-if="!result.steps.login.ok">
                  <v-chip class="ml-2" color="error" size="x-small" variant="flat">
                    Falha — verifique rede/IP/credenciais
                  </v-chip>
                </template>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-alert
                  :color="result.steps.login.ok ? 'success' : 'error'"
                  density="compact"
                  :icon="result.steps.login.ok ? 'mdi-check' : 'mdi-close'"
                  variant="tonal"
                >
                  {{
                    result.steps.login.ok
                      ? "Login realizado com sucesso"
                      : "Falha no login — dispositivo inacessível (problema de rede, IP ou credenciais)"
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
                    <tr v-for="entry in getCleanEntries(result.steps.clean)" :key="entry.name">
                      <td>{{ entry.name }}</td>
                      <td>
                        <v-icon :color="getStepColor(entry)" :icon="getStepIcon(entry)" size="20" />
                        <span class="ml-1 text-caption">{{ entry.status || "" }}</span>
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
                  :color="getStepColor(result.steps.datetime)"
                  :icon="getStepIcon(result.steps.datetime)"
                  class="mr-2"
                />
                Data/Hora
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-alert
                  :color="result.steps.datetime.ok ? 'success' : 'error'"
                  density="compact"
                  variant="tonal"
                >
                  {{
                    result.steps.datetime.ok
                      ? `Hora sincronizada: ${result.steps.datetime.datetime}`
                      : "Erro ao sincronizar data/hora"
                  }}
                </v-alert>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Monitor -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon
                  :color="getStepColor(result.steps.monitor)"
                  :icon="getStepIcon(result.steps.monitor)"
                  class="mr-2"
                />
                Monitor Push
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-alert
                  :color="result.steps.monitor.ok ? 'success' : 'error'"
                  density="compact"
                  variant="tonal"
                >
                  <template v-if="result.steps.monitor.ok">
                    Monitor configurado: <code>{{ result.steps.monitor.full_url }}</code>
                  </template>
                  <template v-else> Erro ao configurar monitor </template>
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
                    <tr v-for="entry in getPushEntries(result.steps.push)" :key="entry.name">
                      <td>{{ entry.name }}</td>
                      <td class="text-center">
                        <template v-if="entry.skipped">
                          <v-chip color="grey" size="x-small" variant="tonal">Ignorado</v-chip>
                        </template>
                        <template v-else>
                          {{ entry.count ?? "—" }}
                        </template>
                      </td>
                      <td class="text-center">
                        <v-icon :color="getStepColor(entry)" :icon="getStepIcon(entry)" size="20" />
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>

      <!-- Botão para voltar à seleção -->
      <div class="text-center mt-4">
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
                    <v-chip v-if="device.is_default" color="primary" size="x-small" variant="flat">
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
                    Usuários vinculados
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
                    {{ device.monitor_configured ? "Configurado" : "Não configurado" }}
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
