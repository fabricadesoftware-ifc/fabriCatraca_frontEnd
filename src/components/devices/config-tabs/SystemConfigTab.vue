<script setup lang="ts">
  import type { SystemConfig } from '@/types'
  import { computed } from 'vue'

  const props = defineProps<{
    config: SystemConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<SystemConfig>): void
  }>()

  const form = computed({
    get: () => ({
      online: props.config?.online ?? true,
      auto_reboot: props.config?.auto_reboot ?? true,
      catra_timeout: props.config?.catra_timeout ?? 30,
      local_identification: props.config?.local_identification ?? true,
      exception_mode: props.config?.exception_mode ?? 'none',
      language: props.config?.language ?? 'pt_BR',
    }),
    set: () => {}, // Formulário controlado pelo parent via v-model dos campos
  })

  const exceptionModeOptions = [
    { title: 'Normal', value: 'none' },
    { title: 'Liberado (⚠️ Cuidado!)', value: 'free' },
    { title: 'Bloqueado (⚠️ Cuidado!)', value: 'blocked' },
  ]

  const languageOptions = [
    { title: 'Português (BR)', value: 'pt_BR' },
    { title: 'English (US)', value: 'en_US' },
    { title: 'Español (ES)', value: 'es_ES' },
  ]

  function handleSave () {
    emit('save', form.value)
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-switch
          v-model="form.online"
          color="primary"
          hide-details
          label="Dispositivo Online"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-switch
          v-model="form.auto_reboot"
          color="primary"
          hide-details
          label="Reinicialização Automática"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="form.catra_timeout"
          hint="Tempo em segundos"
          label="Timeout da Catraca"
          persistent-hint
          type="number"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-switch
          v-model="form.local_identification"
          color="primary"
          hide-details
          label="Identificação Local"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="form.exception_mode"
          :items="exceptionModeOptions"
          label="Modo de Exceção"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="form.language"
          :items="languageOptions"
          label="Idioma"
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
      Salvar Configurações
    </v-btn>
  </v-container>
</template>
