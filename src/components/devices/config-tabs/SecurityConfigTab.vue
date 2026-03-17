<script setup lang="ts">
  import type { SecurityConfig } from '@/types'
  import { reactive, watch } from 'vue'

  const props = defineProps<{
    config: SecurityConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<SecurityConfig>): void
  }>()

  const form = reactive({
    verbose_logging: true,
    log_type: false,
    multi_factor_authentication: false,
  })

  watch(
    () => props.config,
    newConfig => {
      if (newConfig) {
        form.verbose_logging = newConfig.verbose_logging ?? true
        form.log_type = newConfig.log_type ?? false
        form.multi_factor_authentication
          = newConfig.multi_factor_authentication ?? false
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
        <h3 class="text-h6 mb-2">Logs</h3>
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
        <v-switch
          v-model="form.log_type"
          color="primary"
          hide-details
          label="Tipos de Batida (iDFlex ponto)"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Autenticação</h3>
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

    <v-btn block color="primary" :loading="saving" @click="handleSave">
      Salvar Configurações de Segurança
    </v-btn>
  </v-container>
</template>
