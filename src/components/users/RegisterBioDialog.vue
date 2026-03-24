<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import type { BioCreate } from "@/types";
import { toast } from "vue3-toastify";
import { useBioStore, useDeviceStore } from "@/stores";
import IdBioAgentService from "@/services/idbio_agent";

const props = defineProps<{ modelValue: boolean; userId: number }>();
const emit = defineEmits<{ (e: "update:modelValue", v: boolean): void; (e: "saved"): void }>();

const deviceStore = useDeviceStore();
const bioStore = useBioStore();

const selectedDevice = ref<number | null>(null);
const enrollmentMode = ref<"remote" | "local">("remote");
const localTemplate = ref("");
const captureQuality = ref<number | null>(null);
const capturingLocal = ref(false);
const saving = ref(false);

async function close() {
  emit("update:modelValue", false);
}

async function captureFromUsbAgent() {
  capturingLocal.value = true;
  try {
    await IdBioAgentService.healthCheck();
    const data = await IdBioAgentService.captureTemplate();
    localTemplate.value = data.template;
    captureQuality.value = data.quality;
    toast.success("Digital capturada com sucesso pelo agente USB.");
  } catch (error) {
    console.error(error);
    toast.error("Não foi possível capturar no agente USB local. Verifique se ele está rodando.");
  } finally {
    capturingLocal.value = false;
  }
}

async function save() {
  if (enrollmentMode.value === "remote" && !selectedDevice.value) return;
  if (enrollmentMode.value === "local" && !localTemplate.value.trim()) {
    toast.error("No modo local, informe o template capturado pelo agente USB.");
    return;
  }

  saving.value = true;
  try {
    const payload: Partial<BioCreate> = {
      user_id: props.userId,
      enrollment_mode: enrollmentMode.value,
    };

    if (enrollmentMode.value === "remote") {
      payload.enrollment_device_id = selectedDevice.value;
    } else {
      payload.captured_template = localTemplate.value.trim();
    }

    await bioStore.createBio(payload);
    toast.success("Biometria cadastrada com sucesso!");
    emit("saved");
    await close();
  } catch (error) {
    console.error(error);
    toast.error("Erro ao cadastrar biometria. Por favor, tente novamente.");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (deviceStore.devices.length === 0) {
    await deviceStore.loadDevices();
  }
});

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      selectedDevice.value = null;
      localTemplate.value = "";
      captureQuality.value = null;
      enrollmentMode.value = "remote";
    }
  },
);
</script>

<template>
  <v-dialog
    max-width="600"
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">Selecionar Dispositivo</v-card-title>
      <v-card-text>
        <v-radio-group v-model="enrollmentMode" inline label="Modo de cadastro">
          <v-radio label="Remoto (catraca)" value="remote" />
          <v-radio label="Local USB (SDK)" value="local" />
        </v-radio-group>

        <v-select
          v-if="enrollmentMode === 'remote'"
          v-model="selectedDevice"
          :disabled="deviceStore.loading"
          item-title="name"
          item-value="id"
          :items="deviceStore.devices"
          label="Dispositivo para capturar a digital"
          :loading="deviceStore.loading"
        />

        <v-textarea
          v-else
          v-model="localTemplate"
          label="Template capturado localmente"
          placeholder="Cole aqui o template retornado pelo agente local USB"
          rows="5"
          auto-grow
        />

        <div v-if="enrollmentMode === 'local'" class="d-flex flex-column ga-2 mt-3">
          <div class="text-caption text-medium-emphasis">
            Nao possui o agente instalado? Baixe o pacote:
            <a href="/downloads/idbio-agent-windows.zip" target="_blank" rel="noopener noreferrer">
              idbio-agent-windows.zip
            </a>
          </div>

          <v-btn
            color="secondary"
            prepend-icon="mdi-usb"
            :loading="capturingLocal"
            @click="captureFromUsbAgent"
          >
            Capturar no Leitor USB
          </v-btn>

          <div v-if="captureQuality !== null" class="text-caption text-medium-emphasis">
            Qualidade da captura: {{ captureQuality }}
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">Iniciar Cadastro</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
