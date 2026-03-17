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
    bell_relay: 2,
    network_interlock_enabled: false,
    network_interlock_api_bypass_enabled: false,
    network_interlock_rex_bypass_enabled: false,
    exception_mode: 'none' as 'none' | 'emergency' | 'lock_down',
  })

  watch(
    () => props.config,
    newConfig => {
      if (newConfig) {
        form.beep_enabled = newConfig.beep_enabled ?? true
        form.bell_enabled = newConfig.bell_enabled ?? false
        form.bell_relay = newConfig.bell_relay ?? 2
        form.network_interlock_enabled = newConfig.network_interlock_enabled ?? false
        form.network_interlock_api_bypass_enabled = newConfig.network_interlock_api_bypass_enabled ?? false
        form.network_interlock_rex_bypass_enabled = newConfig.network_interlock_rex_bypass_enabled ?? false
        form.exception_mode = newConfig.exception_mode ?? 'none'
      }
    },
    { immediate: true },
  )

  const exceptionModeOptions = [
    { title: 'Normal', value: 'none' },
    { title: 'Emergencia', value: 'emergency' },
    { title: 'Lockdown', value: 'lock_down' },
  ]

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
        <h3 class="text-h6 mb-2">Campainha</h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-switch
          v-model="form.bell_enabled"
          color="primary"
          hide-details
          label="Campainha Ativada"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="form.bell_relay"
          hide-details
          label="Relé da Campainha"
          min="1"
          type="number"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Intertravamento via Rede</h3>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="form.network_interlock_enabled"
          color="primary"
          hide-details
          label="Intertravamento via Rede"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-switch
          v-model="form.network_interlock_api_bypass_enabled"
          color="primary"
          hide-details
          label="Ignorar ao abrir via API"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-switch
          v-model="form.network_interlock_rex_bypass_enabled"
          color="primary"
          hide-details
          label="Ignorar ao abrir via botoeira"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Outros</h3>
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="form.exception_mode"
          :items="exceptionModeOptions"
          hide-details
          label="Modo de Exce??o"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-btn block color="primary" :loading="saving" @click="handleSave">
      Salvar Configurações de Hardware
    </v-btn>
  </v-container>
</template>
