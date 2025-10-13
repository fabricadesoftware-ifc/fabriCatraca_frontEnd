<script setup lang="ts">
  import type { HardwareConfig } from '@/types'
  import { computed } from 'vue'

  const props = defineProps<{
    config: HardwareConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<HardwareConfig>): void
  }>()

  const form = computed({
    get: () => ({
      beep_enabled: props.config?.beep_enabled ?? true,
      bell_enabled: props.config?.bell_enabled ?? false,
      bell_relay: props.config?.bell_relay ?? 1,
      exception_mode: props.config?.exception_mode ?? false,
      siren_enabled: props.config?.siren_enabled ?? false,
      siren_relay: props.config?.siren_relay ?? 2,
    }),
    set: () => {},
  })

  function handleSave () {
    emit('save', form.value)
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">
          Som (Beep)
        </h3>
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
        <h3 class="text-h6 mb-2">
          Outros
        </h3>
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

    <v-btn
      block
      color="primary"
      :loading="saving"
      @click="handleSave"
    >
      Salvar Configurações de Hardware
    </v-btn>
  </v-container>
</template>
