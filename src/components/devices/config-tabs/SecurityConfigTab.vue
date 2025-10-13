<script setup lang="ts">
  import type { SecurityConfig } from '@/types'
  import { computed } from 'vue'

  const props = defineProps<{
    config: SecurityConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<SecurityConfig>): void
  }>()

  const form = computed({
    get: () => ({
      verbose_logging: props.config?.verbose_logging ?? true,
      log_type: props.config?.log_type ?? 1,
      multi_factor_authentication: props.config?.multi_factor_authentication ?? false,
    }),
    set: () => {},
  })

  const logTypeOptions = [
    { title: 'Desabilitado', value: 0 },
    { title: 'Básico', value: 1 },
    { title: 'Completo', value: 2 },
  ]

  function handleSave () {
    emit('save', form.value)
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">
          Logs
        </h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-switch
          v-model="form.verbose_logging"
          color="primary"
          hide-details
          label="Logs Detalhados"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="form.log_type"
          hide-details
          :items="logTypeOptions"
          label="Tipo de Log"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">
          Autenticação
        </h3>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="form.multi_factor_authentication"
          color="primary"
          hide-details
          label="Autenticação Multi-Fator (MFA)"
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
      Salvar Configurações de Segurança
    </v-btn>
  </v-container>
</template>
