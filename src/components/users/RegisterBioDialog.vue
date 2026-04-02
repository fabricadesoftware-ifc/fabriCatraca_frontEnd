<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
  import { toast } from "vue3-toastify"
  import { useBioStore, useDeviceStore } from "@/stores"

  const props = defineProps<{ modelValue: boolean, userId: number }>()
  const emit = defineEmits<{ (e: "update:modelValue", v: boolean): void, (e: "saved"): void }>()

  const deviceStore = useDeviceStore()
  const bioStore = useBioStore()

  const captureMode = ref<"catraca" | "local">("catraca")
  const selectedDevice = ref<number | null>(null)
  const extractorDevice = ref<number | null>(null)
  const sensorIdentifier = ref("local-default")
  const saving = ref(false)
  const polling = ref(false)
  const pollingHandle = ref<number | null>(null)

  const activeDevices = computed(() => deviceStore.devices.filter(device => device.is_active))
  const captureSession = computed(() => bioStore.captureSession)
  const localCaptureRunning = computed(() =>
    Boolean(captureSession.value && ["pending", "processing"].includes(captureSession.value.status)),
  )

  const localStatusLabel = computed(() => {
    switch (captureSession.value?.status) {
      case "pending":
        return "Aguardando o microcontrolador iniciar a captura."
      case "processing":
        return "Microcontrolador processando a biometria."
      case "completed":
        return "Biometria concluida e salva."
      case "failed":
        return "Falha na captura local."
      case "expired":
        return "Sessao expirada."
      case "cancelled":
        return "Sessao cancelada."
      default:
        return "Inicie a captura local para continuar."
    }
  })

  function clearPolling () {
    if (pollingHandle.value !== null) {
      window.clearTimeout(pollingHandle.value)
      pollingHandle.value = null
    }
    polling.value = false
  }

  async function close () {
    clearPolling()
    emit("update:modelValue", false)
  }

  function resetForm () {
    captureMode.value = "catraca"
    selectedDevice.value = null
    extractorDevice.value = null
    sensorIdentifier.value = "local-default"
    bioStore.captureSession = null
    clearPolling()
  }

  async function pollLocalStatus (sessionId: number) {
    polling.value = true
    try {
      const session = await bioStore.loadLocalCaptureStatus(sessionId)

      if (session.status === "completed") {
        toast.success("Biometria cadastrada com sucesso!")
        emit("saved")
        await close()
        return
      }

      if (["failed", "expired", "cancelled"].includes(session.status)) {
        toast.error(session.error_message || "A captura local nao foi concluida.")
        clearPolling()
        return
      }

      pollingHandle.value = window.setTimeout(() => {
        void pollLocalStatus(sessionId)
      }, 2000)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.error || "Nao foi possivel acompanhar a sessao de captura.")
      clearPolling()
    }
  }

  async function save () {
    if (captureMode.value === "catraca" && !selectedDevice.value) {
      toast.warning("Selecione a catraca que vai capturar a digital.")
      return
    }

    if (captureMode.value === "local" && !sensorIdentifier.value.trim()) {
      toast.warning("Informe o identificador do microcontrolador.")
      return
    }

    saving.value = true
    try {
      if (captureMode.value === "local") {
        const session = await bioStore.startLocalCapture({
          user_id: props.userId,
          extractor_device_id: extractorDevice.value,
          sensor_identifier: sensorIdentifier.value.trim(),
        })
        toast.info("Sessao criada. Passe o dedo 3 vezes no leitor local.")
        await pollLocalStatus(session.id)
        return
      }

      await bioStore.createBio({
        user_id: props.userId,
        capture_mode: "catraca",
        enrollment_device_id: selectedDevice.value ?? undefined,
      })
      toast.success("Biometria cadastrada com sucesso!")
      emit("saved")
      await close()
    } catch (error: any) {
      console.error(error)
      const backendMessage = error?.response?.data?.details || error?.response?.data?.error
      toast.error(backendMessage || "Erro ao cadastrar biometria. Por favor, tente novamente.")
    } finally {
      saving.value = false
    }
  }

  onMounted(async () => {
    if (deviceStore.devices.length === 0) {
      await deviceStore.loadDevices()
    }
  })

  onBeforeUnmount(() => {
    clearPolling()
  })

  watch(() => props.modelValue, v => {
    if (v) {
      resetForm()
    } else {
      clearPolling()
    }
  })
</script>

<template>
  <v-dialog max-width="720" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">Cadastrar Biometria</v-card-title>
      <v-card-text class="d-flex flex-column ga-4">
        <v-radio-group v-model="captureMode" inline :disabled="localCaptureRunning">
          <v-radio label="Pela catraca" value="catraca" />
          <v-radio label="Pelo microcontrolador local" value="local" />
        </v-radio-group>

        <v-select
          v-if="captureMode === 'catraca'"
          v-model="selectedDevice"
          :disabled="deviceStore.loading"
          item-title="name"
          item-value="id"
          :items="activeDevices"
          label="Catraca para capturar a digital"
          :loading="deviceStore.loading"
        />

        <template v-else>
          <v-text-field
            v-model="sensorIdentifier"
            :disabled="localCaptureRunning"
            label="Identificador do microcontrolador"
            hint="Deixe igual ao configurado no ESP, por exemplo local-default."
            persistent-hint
          />

          <v-select
            v-model="extractorDevice"
            clearable
            :disabled="localCaptureRunning"
            item-title="name"
            item-value="id"
            :items="activeDevices"
            label="Catraca ativa para extrair o template"
            hint="Se vazio, o backend usa a catraca padrao ativa ou a primeira ativa."
            persistent-hint
          />

          <v-alert type="info" variant="tonal">
            {{ localStatusLabel }}
          </v-alert>

          <v-table v-if="captureSession?.attempts?.length">
            <thead>
              <tr>
                <th>Tentativa</th>
                <th>Qualidade</th>
                <th>Selecionada</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="attempt in captureSession.attempts" :key="String(attempt.attempt)">
                <td>{{ attempt.attempt }}</td>
                <td>{{ attempt.quality }}</td>
                <td>{{ attempt.selected ? "Sim" : "Nao" }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :disabled="localCaptureRunning" :loading="saving || polling" @click="save">
          {{ captureMode === "local" ? "Iniciar captura local" : "Iniciar cadastro" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
