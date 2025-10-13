<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue'
  import { toast } from 'vue3-toastify'
  import { useBioStore, useDeviceStore } from '@/stores'

  const props = defineProps<{ modelValue: boolean, userId: number }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void, (e: 'saved'): void }>()

  const deviceStore = useDeviceStore()
  const bioStore = useBioStore()

  const selectedDevice = ref<number | null>(null)
  const saving = ref(false)

  async function close () {
    emit('update:modelValue', false)
  }

  async function save () {
    if (!selectedDevice.value) return
    saving.value = true
    try {
      await bioStore.createBio({ user_id: props.userId, enrollment_device_id: selectedDevice.value })
      toast.success('Biometria cadastrada com sucesso!')
      emit('saved')
      await close()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao cadastrar biometria. Por favor, tente novamente.')
    } finally {
      saving.value = false
    }
  }

  onMounted(async () => {
    if (deviceStore.devices.length === 0) {
      await deviceStore.loadDevices()
    }
  })

  watch(() => props.modelValue, v => {
    if (v) selectedDevice.value = null
  })
</script>

<template>
  <v-dialog max-width="600" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">Selecionar Dispositivo</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedDevice"
          :disabled="deviceStore.loading"
          item-title="name"
          item-value="id"
          :items="deviceStore.devices"
          label="Dispositivo para capturar a digital"
          :loading="deviceStore.loading"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">Iniciar Cadastro</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>
