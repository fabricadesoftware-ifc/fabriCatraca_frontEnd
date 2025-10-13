<script setup lang="ts">
  import type { PushServerConfig } from '@/types'
  import { computed } from 'vue'

  const props = defineProps<{
    config: PushServerConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<PushServerConfig>): void
  }>()

  const form = computed({
    get: () => ({
      push_request_timeout: props.config?.push_request_timeout ?? 30,
      push_request_period: props.config?.push_request_period ?? 60,
      push_remote_address: props.config?.push_remote_address ?? '',
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
          Conexão
        </h3>
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="form.push_remote_address"
          hide-details
          label="Endereço do Servidor Push"
          placeholder="ex: push.example.com ou 192.168.1.100"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">
          Temporização
        </h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="form.push_request_timeout"
          hide-details
          label="Timeout (segundos)"
          min="1"
          type="number"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="form.push_request_period"
          hide-details
          label="Período de Envio (segundos)"
          min="1"
          type="number"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-alert
      v-if="!form.push_remote_address"
      class="mb-4"
      type="info"
      variant="tonal"
    >
      Configure o endereço do servidor push para enviar eventos em tempo real.
    </v-alert>

    <v-btn
      block
      color="primary"
      :loading="saving"
      @click="handleSave"
    >
      Salvar Configurações do Push Server
    </v-btn>
  </v-container>
</template>
