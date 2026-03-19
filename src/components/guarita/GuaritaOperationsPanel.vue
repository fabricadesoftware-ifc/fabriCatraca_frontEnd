<script setup lang="ts">
import type { EasySetupDevice, Portal } from "@/types";
import { computed, onMounted, reactive, ref } from "vue";
import { toast } from "vue3-toastify";
import ReleaseAuditTable from "@/components/release-audits/ReleaseAuditTable.vue";
import { useAuthStore } from "@/stores";
import DeviceActionsService from "@/services/device_actions";
import EasySetupService from "@/services/easy_setup";
import PortalsService from "@/services/portals";

const authStore = useAuthStore();
const devices = ref<EasySetupDevice[]>([]);
const portals = ref<Portal[]>([]);
const loading = ref(false);
const submitting = ref(false);
const selectedDeviceIds = ref<number[]>([]);

const form = reactive({
  release_mode: "single_turn" as "device_event" | "single_turn",
  portal_id: null as number | null,
  direction: "clockwise" as "clockwise" | "anticlockwise",
  event: 7,
  user_name: "",
  notes: "",
});

const selectedDevices = computed(() =>
  devices.value.filter(device => selectedDeviceIds.value.includes(device.id)),
);

async function loadData() {
  loading.value = true;
  try {
    const [deviceResponse, portalResponse] = await Promise.all([
      EasySetupService.getDevices(),
      PortalsService.getPortals({ page_size: 1000 }),
    ]);
    devices.value = deviceResponse.devices;
    portals.value = portalResponse.results;
    if (!form.portal_id && portalResponse.results.length > 0) {
      form.portal_id = portalResponse.results[0].id;
    }
  } catch (error) {
    console.error(error);
    toast.error("Erro ao carregar dados da guarita");
  } finally {
    loading.value = false;
  }
}

function toggleDevice(id: number) {
  if (selectedDeviceIds.value.includes(id)) {
    selectedDeviceIds.value = selectedDeviceIds.value.filter(deviceId => deviceId !== id);
    return;
  }
  selectedDeviceIds.value = [...selectedDeviceIds.value, id];
}

async function submit() {
  if (!selectedDeviceIds.value.length) {
    toast.warning("Selecione pelo menos uma catraca");
    return;
  }
  if (!form.portal_id) {
    toast.warning("Selecione um portal");
    return;
  }
  if (!form.notes.trim()) {
    toast.warning("Informe o motivo da liberação");
    return;
  }

  submitting.value = true;
  try {
    await DeviceActionsService.remoteUserAuthorization({
      device_ids: selectedDeviceIds.value,
      event: Number(form.event),
      user_id: 0,
      user_name: form.user_name.trim() || "Operação da guarita",
      user_image: false,
      portal_id: Number(form.portal_id),
      release_mode: form.release_mode,
      notes: form.notes.trim(),
      actions: [
        {
          action: "catra",
          parameters: `allow=${form.direction}`,
        },
      ],
    });
    form.notes = "";
    toast.success("Liberação registrada e enviada com sucesso");
  } catch (error: any) {
    console.error(error);
    toast.error(error?.response?.data?.error || "Erro ao executar liberação");
  } finally {
    submitting.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <v-container class="pa-0" fluid>
    <v-row>
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Catracas da guarita</span>
            <v-btn
              color="default"
              prepend-icon="mdi-refresh"
              size="small"
              variant="outlined"
              @click="loadData"
            >
              Atualizar
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-progress-linear v-if="loading" color="primary" indeterminate />
            <v-list v-else>
              <v-list-item
                v-for="device in devices"
                :key="device.id"
                @click="toggleDevice(device.id)"
              >
                <template #prepend>
                  <v-checkbox
                    color="primary"
                    hide-details
                    :model-value="selectedDeviceIds.includes(device.id)"
                  />
                </template>
                <v-list-item-title>{{ device.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ device.ip }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card>
          <v-card-title>Liberação operacional</v-card-title>
          <v-card-text>
            <v-alert class="mb-4" type="info" variant="tonal">
              Toda ação da guarita fica registrada na auditoria com o operador autenticado.
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.release_mode"
                  :items="[
                    { title: 'Giro único', value: 'single_turn' },
                    { title: 'Liberação para evento', value: 'device_event' },
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Tipo de liberação"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.portal_id"
                  :items="portals"
                  item-title="name"
                  item-value="id"
                  label="Portal"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.direction"
                  :items="[
                    { title: 'Entrada / Horário', value: 'clockwise' },
                    { title: 'Saída / Anti-horário', value: 'anticlockwise' },
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Sentido"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.event"
                  label="Código do evento"
                  type="number"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.user_name"
                  label="Identificação exibida"
                  placeholder="Ex.: Evento institucional"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.notes"
                  auto-grow
                  label="Motivo da liberação"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <div class="text-caption text-medium-emphasis">
              {{ selectedDevices.length }} catraca(s) selecionada(s)
            </div>
            <v-spacer />
            <v-btn color="primary" :loading="submitting" @click="submit">
              Liberar agora
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
        <ReleaseAuditTable
          title="Minhas liberações na guarita"
          :filters="{ requested_by: authStore.user?.id }"
          :release-types="['device_event', 'single_turn']"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
