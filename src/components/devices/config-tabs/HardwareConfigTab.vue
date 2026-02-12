<script setup lang="ts">
  import type { HardwareConfig } from '@/types'
  import { reactive, watch } from 'vue'

  const props = defineProps<{
    config: HardwareConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<HardwareConfig>): void
  }>()

  const form = reactive({
    beep_enabled: true,
    bell_enabled: false,
    bell_relay: 1,
    exception_mode: false,
    siren_enabled: false,
    siren_relay: 2,
  })

  watch(
    () => props.config,
    newConfig => {
      if (newConfig) {
        form.beep_enabled = newConfig.beep_enabled ?? true
        form.bell_enabled = newConfig.bell_enabled ?? false
        form.bell_relay = newConfig.bell_relay ?? 1
        form.exception_mode = newConfig.exception_mode ?? false
        form.siren_enabled = newConfig.siren_enabled ?? false
        form.siren_relay = newConfig.siren_relay ?? 2
      }
    },
    { immediate: true },
  )

  function handleSave () {
    emit('save', { ...form })
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Som (Beep)</h3>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="form.beep_enabled"
          color="primary"
          hide-details
          label="Beep Ativado"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Outros</h3>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="form.exception_mode"
          color="warning"
          hide-details
          label="Modo de Exceção"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-btn block color="primary" :loading="saving" @click="handleSave">
      Salvar Configurações de Hardware
    </v-btn>
  </v-container>
</template>
