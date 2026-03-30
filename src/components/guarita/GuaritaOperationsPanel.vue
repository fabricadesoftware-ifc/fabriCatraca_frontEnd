<script setup lang="ts">
import type { Device, Portal } from "@/types";
import { computed, onMounted, reactive, ref } from "vue";
import { toast } from "vue3-toastify";
import ReleaseAuditTable from "@/components/release-audits/ReleaseAuditTable.vue";
import { useAuthStore, useDeviceStore } from "@/stores";
import DeviceActionsService from "@/services/device_actions";
import PortalsService from "@/services/portals";

const authStore = useAuthStore();
const deviceStore = useDeviceStore();

const portals = ref<Portal[]>([]);
const loading = ref(false);
const submitting = ref(false);
const releasingDeviceId = ref<number | null>(null);
const releasingDirection = ref<string | null>(null);

// Notes independente por device
const deviceNotes = reactive<Record<number, string>>({});

const form = reactive({
  release_mode: "single_turn" as "device_event" | "single_turn",
  portal_id: null as number | null,
  direction: "clockwise" as "clockwise" | "anticlockwise",
  event: 7,
  user_name: "Liberação da guarita",
  notes: "",
});

const activeDevices = computed(() => deviceStore.devices.filter((d) => d.is_active));

function isReleasing(deviceId: number, dir?: string) {
  if (dir) {
    return releasingDeviceId.value === deviceId && releasingDirection.value === dir;
  }
  return releasingDeviceId.value === deviceId;
}

async function releaseDevice(device: Device, direction: "clockwise" | "anticlockwise" | "both") {
  const notes = deviceNotes[device.id]?.trim();

  if (!notes) {
    toast.warning("Informe o motivo da liberação");
    return;
  }

  if (!portals.value.length) {
    toast.warning("Nenhum portal configurado. Configure um portal primeiro.");
    return;
  }

  const portalId = form.portal_id || portals.value[0].id;
  releasingDeviceId.value = device.id;
  releasingDirection.value = direction;

  try {
    if (direction === "both") {
      await Promise.all([
        DeviceActionsService.remoteUserAuthorization({
          device_ids: [device.id],
          event: 7,
          user_id: 0,
          user_name: "Liberação da guarita",
          user_image: false,
          portal_id: portalId,
          release_mode: "device_event",
          notes:
            notes ||
            `Liberação rápida (ambos) - ${device.name} - ${authStore.user?.name || "Usuário desconhecido"}`,
          actions: [{ action: "catra", parameters: "allow=clockwise" }],
        }),
        DeviceActionsService.remoteUserAuthorization({
          device_ids: [device.id],
          event: 7,
          user_id: 0,
          user_name: "Liberação da guarita",
          user_image: false,
          portal_id: portalId,
          release_mode: "device_event",
          notes:
            notes ||
            `Liberação rápida (ambos) - ${device.name} - ${authStore.user?.name || "Usuário desconhecido"}`,
          actions: [{ action: "catra", parameters: "allow=anticlockwise" }],
        }),
      ]);
      toast.success(`${device.name}: liberada nos dois sentidos!`);
    } else {
      await DeviceActionsService.remoteUserAuthorization({
        device_ids: [device.id],
        event: 7,
        user_id: 0,
        user_name: "Liberação da guarita",
        user_image: false,
        portal_id: portalId,
        release_mode: "device_event",
        notes:
          notes ||
          `Liberação rápida (${direction}) - ${device.name} - ${authStore.user?.name || "Usuário desconhecido"}`,
        actions: [{ action: "catra", parameters: `allow=${direction}` }],
      });
      toast.success(
        `${device.name}: liberada para ${direction === "clockwise" ? "direita" : "esquerda"}!`,
      );
    }

    // Limpa o notes do device após sucesso
    deviceNotes[device.id] = "";
  } catch (error: any) {
    console.error(error);
    toast.error(error?.response?.data?.error || "Erro ao executar liberação");
  } finally {
    releasingDeviceId.value = null;
    releasingDirection.value = null;
  }
}

async function submit() {
  if (!activeDevices.value.length) {
    toast.warning("Nenhuma catraca ativa encontrada");
    return;
  }
  if (!form.portal_id && !portals.value.length) {
    toast.warning("Nenhum portal configurado");
    return;
  }
  if (!form.notes.trim()) {
    toast.warning("Informe o motivo da liberação");
    return;
  }

  const deviceIds = activeDevices.value.map((d) => d.id);
  const portalId = form.portal_id || portals.value[0].id;

  submitting.value = true;
  try {
    await DeviceActionsService.remoteUserAuthorization({
      device_ids: deviceIds,
      event: Number(form.event),
      user_id: 0,
      user_name: form.user_name.trim() || "Operação da guarita",
      user_image: false,
      portal_id: portalId,
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

async function loadPortals() {
  try {
    const response = await PortalsService.getPortals({ page_size: 100 });
    portals.value = response.results;
    if (portals.value.length) {
      form.portal_id = portals.value[0].id;
    }
  } catch (error) {
    console.error("Erro ao carregar portais:", error);
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([deviceStore.loadDevices({ page_size: 100 }), loadPortals()]);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-container class="pa-0" fluid>
    <v-row>
      <!-- Grid de catracas ativas -->
      <v-col cols="12" md="8">
        <div class="d-flex align-center justify-end mb-4">
          <v-btn
            :loading="loading"
            prepend-icon="mdi-refresh"
            size="small"
            variant="text"
            @click="deviceStore.loadDevices({ page_size: 100 })"
          >
            Atualizar
          </v-btn>
        </div>

        <v-progress-linear v-if="loading" class="mb-4" color="primary" indeterminate />

        <v-row v-else>
          <v-col v-for="device in activeDevices" :key="device.id" cols="12" lg="3" md="6">
            <v-card :loading="isReleasing(device.id)">
              <v-card-title class="d-flex align-center justify-space-between pb-4">
                <span class="text-body-1 font-weight-medium">{{ device.name }}</span>
              </v-card-title>

              <v-card-text>
                <!-- Notes independente por device via v-model -->
                <v-textarea
                  v-model="deviceNotes[device.id]"
                  label="Motivo"
                  variant="outlined"
                  rows="3"
                  hide-details
                />
              </v-card-text>

              <v-card-actions class="flex-wrap ga-2 px-4 pb-4 justify-center">
                <v-btn
                  color="warning"
                  :loading="isReleasing(device.id, 'anticlockwise')"
                  prepend-icon="mdi-arrow-left"
                  size="small"
                  variant="tonal"
                  :disabled="!deviceNotes[device.id]?.trim()"
                  @click="releaseDevice(device, 'anticlockwise')"
                >
                  Esquerda
                </v-btn>
                <v-btn
                  color="warning"
                  :loading="isReleasing(device.id, 'clockwise')"
                  prepend-icon="mdi-arrow-right"
                  size="small"
                  variant="tonal"
                  :disabled="!deviceNotes[device.id]?.trim()"
                  @click="releaseDevice(device, 'clockwise')"
                >
                  Direita
                </v-btn>
              </v-card-actions>

              <div class="px-4 pb-8 d-flex justify-center">
                <v-btn
                  block
                  color="success"
                  :loading="isReleasing(device.id, 'both')"
                  prepend-icon="mdi-arrow-left-right"
                  size="small"
                  variant="tonal"
                  :disabled="!deviceNotes[device.id]?.trim()"
                  @click="releaseDevice(device, 'both')"
                >
                  Liberar
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <v-col v-if="!activeDevices.length && !loading" cols="12">
            <v-alert type="info" variant="tonal"> Nenhuma catraca ativa encontrada. </v-alert>
          </v-col>
        </v-row>
      </v-col>

      <!-- Liberação operacional -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Liberação operacional</v-card-title>
          <v-card-text>
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
                  v-model="form.direction"
                  :items="[
                    { title: 'Entrada / Anti-horário', value: 'clockwise' },
                    { title: 'Saída / Horário', value: 'anticlockwise' },
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Sentido"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea v-model="form.notes" auto-grow label="Motivo da liberação" rows="3" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <div class="text-caption text-medium-emphasis">
              {{ activeDevices.length }} catraca(s) ativa(s)
            </div>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="submitting"
              :disabled="!form.notes?.trim()"
              @click="submit"
            >
              Liberar agora
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Tabela de auditoria -->
      <v-col cols="12">
        <ReleaseAuditTable
          :filters="{ requested_by: authStore.user?.id }"
          :release-types="['device_event', 'single_turn']"
          title="Minhas liberações na guarita"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
