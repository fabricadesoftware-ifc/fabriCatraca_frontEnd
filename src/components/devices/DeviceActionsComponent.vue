<script lang="ts" setup>
import type { EasySetupDevice, Portal } from "@/types";
import { computed, onMounted, reactive, ref } from "vue";
import { toast } from "vue3-toastify";
import DeviceActionsService from "@/services/device_actions";
import EasySetupService from "@/services/easy_setup";
import PortalsService from "@/services/portals";

type ActionTab = "message" | "buzzer" | "authorization";

const devices = ref<EasySetupDevice[]>([]);
const portals = ref<Portal[]>([]);
const loadingDevices = ref(false);
const loadingPortals = ref(false);
const submitting = ref(false);
const confirmDialog = ref(false);
const activeTab = ref<ActionTab>("message");
const selectedIds = ref<number[]>([]);
const deviceSearch = ref("");

const messageForm = reactive({
  message: "",
  timeout: 3000,
});

const buzzerForm = reactive({
  frequency: 4000,
  duty_cycle: 50,
  timeout: 1000,
});

const authorizationForm = reactive({
  event: 7,
  user_id: 0,
  user_name: "Acesso remoto",
  user_image: false,
  portal_id: null as number | null,
  direction: "clockwise" as "clockwise" | "anticlockwise",
});

const filteredDevices = computed(() => {
  const search = deviceSearch.value.trim().toLowerCase();

  if (!search) {
    return devices.value;
  }

  return devices.value.filter(device =>
    [device.name, device.ip].some(value => value.toLowerCase().includes(search)),
  );
});

const selectedCount = computed(() => selectedIds.value.length);
const allSelected = computed(() =>
  devices.value.length > 0 && selectedIds.value.length === devices.value.length,
);
const someSelected = computed(() =>
  selectedIds.value.length > 0 && selectedIds.value.length < devices.value.length,
);

const selectedDevices = computed(() =>
  devices.value.filter(device => selectedIds.value.includes(device.id)),
);

const currentActionTitle = computed(() => {
  switch (activeTab.value) {
    case "message":
      return "Apresentar mensagem na tela";
    case "buzzer":
      return "Acionar buzzer";
    case "authorization":
      return "Autorizar acesso remotamente";
    default:
      return "Executar acao";
  }
});

const currentActionIcon = computed(() => {
  switch (activeTab.value) {
    case "message":
      return "mdi-message-text";
    case "buzzer":
      return "mdi-bullhorn";
    case "authorization":
      return "mdi-turnstile";
    default:
      return "mdi-play";
  }
});

const authorizationActionPreview = computed(() =>
  `catra / allow=${authorizationForm.direction}`,
);

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object"
    && error !== null
    && "response" in error
    && typeof error.response === "object"
    && error.response !== null
    && "data" in error.response
  ) {
    const responseData = error.response.data as Record<string, unknown>;

    if (typeof responseData?.message === "string") {
      return responseData.message;
    }

    if (typeof responseData?.error === "string") {
      return responseData.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = [];
    return;
  }

  selectedIds.value = devices.value.map(device => device.id);
}

function toggleDevice(deviceId: number) {
  const index = selectedIds.value.indexOf(deviceId);

  if (index >= 0) {
    selectedIds.value.splice(index, 1);
    return;
  }

  selectedIds.value.push(deviceId);
}

async function loadDevices() {
  loadingDevices.value = true;

  try {
    const response = await EasySetupService.getDevices();
    devices.value = response.devices;
    selectedIds.value = response.devices
      .filter(device => device.selected)
      .map(device => device.id);
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao carregar catracas"));
  } finally {
    loadingDevices.value = false;
  }
}

async function loadPortals() {
  loadingPortals.value = true;

  try {
    const response = await PortalsService.getPortals({ page_size: 1000 });
    portals.value = response.results;

    if (!authorizationForm.portal_id && response.results.length > 0) {
      authorizationForm.portal_id = response.results[0].id;
    }
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao carregar portais"));
  } finally {
    loadingPortals.value = false;
  }
}

function openConfirmDialog() {
  if (selectedCount.value === 0) {
    toast.warning("Selecione pelo menos uma catraca");
    return;
  }

  confirmDialog.value = true;
}

function validateCurrentAction() {
  if (activeTab.value === "message") {
    if (messageForm.timeout < 0) {
      toast.warning("O timeout da mensagem deve ser maior ou igual a zero");
      return false;
    }

    return true;
  }

  if (activeTab.value === "buzzer") {
    if (buzzerForm.frequency <= 0) {
      toast.warning("A frequencia do buzzer deve ser maior que zero");
      return false;
    }

    if (buzzerForm.duty_cycle <= 0 || buzzerForm.duty_cycle > 100) {
      toast.warning("O duty cycle deve estar entre 1 e 100");
      return false;
    }

    if (buzzerForm.timeout <= 0 || buzzerForm.timeout > 3000) {
      toast.warning("O timeout do buzzer deve estar entre 1 e 3000 ms");
      return false;
    }

    return true;
  }

  if (!authorizationForm.portal_id) {
    toast.warning("Selecione um portal para a autorizacao remota");
    return false;
  }

  if (!Number.isInteger(Number(authorizationForm.event))) {
    toast.warning("Informe um codigo de evento valido");
    return false;
  }

  return true;
}

async function executeCurrentAction() {
  confirmDialog.value = false;

  if (!validateCurrentAction()) {
    return;
  }

  submitting.value = true;

  try {
    if (activeTab.value === "message") {
      await DeviceActionsService.messageToScreen({
        device_ids: selectedIds.value,
        message: messageForm.message,
        timeout: Number(messageForm.timeout),
      });

      toast.success("Mensagem enviada para as catracas selecionadas");
      return;
    }

    if (activeTab.value === "buzzer") {
      await DeviceActionsService.buzzerBuzz({
        device_ids: selectedIds.value,
        frequency: Number(buzzerForm.frequency),
        duty_cycle: Number(buzzerForm.duty_cycle),
        timeout: Number(buzzerForm.timeout),
      });

      toast.success("Buzzer acionado nas catracas selecionadas");
      return;
    }

    await DeviceActionsService.remoteUserAuthorization({
      device_ids: selectedIds.value,
      event: Number(authorizationForm.event),
      user_id: Number(authorizationForm.user_id),
      user_name: authorizationForm.user_name.trim() || "Acesso remoto",
      user_image: authorizationForm.user_image,
      portal_id: Number(authorizationForm.portal_id),
      actions: [
        {
          action: "catra",
          parameters: `allow=${authorizationForm.direction}`,
        },
      ],
    });

    toast.success("Autorizacao remota enviada com sucesso");
  } catch (error) {
    toast.error(getErrorMessage(error, "Erro ao executar a acao"));
  } finally {
    submitting.value = false;
  }
}

async function reloadData() {
  await Promise.all([loadDevices(), loadPortals()]);
}

onMounted(reloadData);
</script>

<template>
  <v-container class="pa-6" fluid>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h2 class="text-h5 font-weight-bold">Acoes em Catracas</h2>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Selecione as catracas e execute a acao remota desejada.
        </p>
      </div>

      <div class="d-flex ga-2">
        <v-btn
          color="default"
          :disabled="loadingDevices || loadingPortals || submitting"
          prepend-icon="mdi-refresh"
          variant="outlined"
          @click="reloadData"
        >
          Recarregar
        </v-btn>

        <v-btn
          color="primary"
          :disabled="selectedCount === 0 || submitting"
          :loading="submitting"
          :prepend-icon="currentActionIcon"
          @click="openConfirmDialog"
        >
          Executar acao
        </v-btn>
      </div>
    </div>

    <v-row>
      <v-col cols="12" lg="5">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
            <span>Catracas</span>
            <v-chip color="primary" size="small" variant="tonal">
              {{ selectedCount }} selecionada(s)
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="deviceSearch"
              class="mb-4"
              clearable
              density="comfortable"
              hide-details
              label="Buscar por nome ou IP"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />

            <v-card class="mb-4" elevation="0" rounded="lg" variant="tonal">
              <v-card-text class="d-flex align-center pa-4">
                <v-checkbox
                  class="mr-2"
                  color="primary"
                  hide-details
                  :indeterminate="someSelected"
                  :model-value="allSelected"
                  @update:model-value="toggleAll"
                />
                <span class="text-body-2 font-weight-medium">
                  Selecionar todas as catracas
                </span>
              </v-card-text>
            </v-card>

            <v-progress-linear
              v-if="loadingDevices"
              class="mb-4"
              color="primary"
              indeterminate
            />

            <div v-else-if="filteredDevices.length > 0" class="device-list">
              <v-card
                v-for="device in filteredDevices"
                :key="device.id"
                class="mb-3 device-card"
                :class="{ 'border-primary': selectedIds.includes(device.id) }"
                elevation="1"
                rounded="lg"
                @click="toggleDevice(device.id)"
              >
                <v-card-text class="d-flex align-start pa-4">
                  <v-checkbox
                    class="mr-2"
                    color="primary"
                    hide-details
                    :model-value="selectedIds.includes(device.id)"
                    @click.stop
                    @update:model-value="toggleDevice(device.id)"
                  />

                  <div class="flex-grow-1">
                    <div class="d-flex align-center ga-2 mb-1 flex-wrap">
                      <span class="text-subtitle-1 font-weight-bold">{{ device.name }}</span>
                      <v-chip
                        v-if="device.is_default"
                        color="primary"
                        size="x-small"
                        variant="flat"
                      >
                        Padrao
                      </v-chip>
                    </div>
                    <div class="text-body-2 text-medium-emphasis">{{ device.ip }}</div>
                    <div class="text-caption text-medium-emphasis mt-2">
                      Usuarios: {{ device.user_count }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <v-alert
              v-else
              color="info"
              icon="mdi-information"
              variant="tonal"
            >
              Nenhuma catraca encontrada para selecao.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card elevation="2" rounded="lg">
          <v-tabs v-model="activeTab" color="primary">
            <v-tab value="message">Mensagem</v-tab>
            <v-tab value="buzzer">Buzzer</v-tab>
            <v-tab value="authorization">Autorizacao Remota</v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="activeTab">
            <v-window-item value="message">
              <v-card-text class="pa-6">
                <v-textarea
                  v-model="messageForm.message"
                  auto-grow
                  label="Mensagem"
                  rows="4"
                  variant="outlined"
                />

                <v-text-field
                  v-model.number="messageForm.timeout"
                  class="mt-4"
                  hint="0 exibe a mensagem continuamente"
                  label="Timeout (ms)"
                  persistent-hint
                  type="number"
                  variant="outlined"
                />
              </v-card-text>
            </v-window-item>

            <v-window-item value="buzzer">
              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="buzzerForm.frequency"
                      label="Frequencia (Hz)"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="buzzerForm.duty_cycle"
                      label="Duty Cycle (%)"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="buzzerForm.timeout"
                      label="Timeout (ms)"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-window-item>

            <v-window-item value="authorization">
              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="authorizationForm.event"
                      hint="O exemplo da documentacao usa 7 para acesso concedido"
                      label="Codigo do evento"
                      persistent-hint
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="authorizationForm.portal_id"
                      :items="portals"
                      item-title="name"
                      item-value="id"
                      :loading="loadingPortals"
                      label="Portal"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="authorizationForm.user_id"
                      label="User ID"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="authorizationForm.user_name"
                      label="Nome do usuario"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="authorizationForm.direction"
                      :items="[
                        { title: 'Horario', value: 'clockwise' },
                        { title: 'Anti-horario', value: 'anticlockwise' },
                      ]"
                      item-title="title"
                      item-value="value"
                      label="Sentido liberado"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-switch
                      v-model="authorizationForm.user_image"
                      color="primary"
                      hide-details
                      label="Usuario possui foto"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="confirmDialog" max-width="640">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2">
          <v-icon :icon="currentActionIcon" />
          <span>{{ currentActionTitle }}</span>
        </v-card-title>

        <v-card-text>
          <p class="mb-4">
            Esta acao sera executada em <strong>{{ selectedCount }} catraca(s)</strong>.
          </p>

          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="device in selectedDevices"
              :key="device.id"
              color="primary"
              size="small"
              variant="tonal"
            >
              {{ device.name }}
            </v-chip>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="submitting" @click="executeCurrentAction">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.device-list {
  max-height: 720px;
  overflow-y: auto;
}

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
