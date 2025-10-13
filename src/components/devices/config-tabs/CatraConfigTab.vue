<script setup lang="ts">
  import type { CatraConfig } from '@/types'
  import { computed } from 'vue'

  const props = defineProps<{
    config: CatraConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<CatraConfig>): void
  }>()

  const form = computed({
    get: () => ({
      anti_passback: props.config?.anti_passback ?? false,
      daily_reset: props.config?.daily_reset ?? false,
      gateway: props.config?.gateway ?? 'clockwise',
      operation_mode: props.config?.operation_mode ?? 'blocked',
    }),
    set: () => {},
  })

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
    emit('save', form.value)
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">
          Modo de Operação
        </h3>
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
        <h3 class="text-h6 mb-2">
          Controle de Acesso
        </h3>
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

    <v-btn
      block
      color="primary"
      :loading="saving"
      @click="handleSave"
    >
      Salvar Configurações da Catraca
    </v-btn>
  </v-container>
</template>
