<script setup lang="ts">
  import type { CatraConfig } from '@/types'
  import { reactive, watch } from 'vue'

  const props = defineProps<{
    config: CatraConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<CatraConfig>): void
  }>()

  const form = reactive({
    anti_passback: false,
    daily_reset: false,
    gateway: 'clockwise' as 'clockwise' | 'anticlockwise',
    operation_mode: 'blocked' as
    | 'blocked'
    | 'entrance_open'
    | 'exit_open'
    | 'both_open',
  })

  watch(
    () => props.config,
    newConfig => {
      if (newConfig) {
        form.anti_passback = newConfig.anti_passback ?? false
        form.daily_reset = newConfig.daily_reset ?? false
        form.gateway = newConfig.gateway ?? 'clockwise'
        form.operation_mode = newConfig.operation_mode ?? 'blocked'
      }
    },
    { immediate: true },
  )

  const gatewayOptions = [
    { title: 'Sentido Horário', value: 'clockwise' },
    { title: 'Sentido Anti-Horário', value: 'anticlockwise' },
  ]

  const operationModeOptions = [
    { title: 'Bloqueado', value: 'blocked' },
    { title: 'Entrada Liberada', value: 'entrance_open' },
    { title: 'Saída Liberada', value: 'exit_open' },
    { title: 'Ambos Liberados', value: 'both_open' },
  ]

  function handleSave () {
    emit('save', { ...form })
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Modo de Operação</h3>
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="form.operation_mode"
          hide-details
          :items="operationModeOptions"
          label="Modo de Operação"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Controle de Acesso</h3>
      </v-col>
      <v-col cols="12" md="4">
        <v-switch
          v-model="form.anti_passback"
          color="primary"
          hide-details
          label="Anti-Passback"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-switch
          v-model="form.daily_reset"
          color="primary"
          hide-details
          label="Reset Diário"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="form.gateway"
          hide-details
          :items="gatewayOptions"
          label="Sentido do Gateway"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-btn block color="primary" :loading="saving" @click="handleSave">
      Salvar Configurações da Catraca
    </v-btn>
  </v-container>
</template>
