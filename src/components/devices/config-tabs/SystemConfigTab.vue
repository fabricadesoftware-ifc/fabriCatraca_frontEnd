<script setup lang="ts">
  import type { SystemConfig } from '@/types'
  import { reactive, watch } from 'vue'

  const props = defineProps<{
    config: SystemConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<SystemConfig>): void
  }>()

  const form = reactive({
    online: true,
    catra_timeout: 30,
    local_identification: true,
    language: 'pt_BR' as string,
  })

  watch(
    () => props.config,
    newConfig => {
      if (newConfig) {
        form.online = newConfig.online ?? true
        form.catra_timeout = newConfig.catra_timeout ?? 30
        form.local_identification = newConfig.local_identification ?? true
        form.language = newConfig.language ?? 'pt_BR'
      }
    },
    { immediate: true },
  )

  const languageOptions = [
    { title: 'Português (BR)', value: 'pt_BR' },
    { title: 'English (US)', value: 'en_US' },
    { title: 'Español (ES)', value: 'es_ES' },
  ]

  function handleSave () {
    emit('save', { ...form })
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
          v-model="form.language"
          :items="languageOptions"
          label="Idioma"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-btn block color="primary" :loading="saving" @click="handleSave">
      Salvar Configurações
    </v-btn>
  </v-container>
</template>
