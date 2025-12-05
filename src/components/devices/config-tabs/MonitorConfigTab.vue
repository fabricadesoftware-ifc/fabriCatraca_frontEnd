<script setup lang="ts">
  import type { MonitorConfig } from '@/types'
  import { reactive, watch } from 'vue'

  const props = defineProps<{
    config: MonitorConfig | null
    saving: boolean
    activating: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<MonitorConfig>): void
    (e: 'activate', config: Partial<MonitorConfig>): void
  }>()

  const form = reactive({
    hostname: '',
    port: '8000',
    path: 'api/control_id_monitor/notifications/dao',
    request_timeout: 5000,
  })

  // Sincroniza form quando config mudar (ex: ao carregar dados da API)
  watch(
    () => props.config,
    newConfig => {
      if (newConfig) {
        form.hostname = newConfig.hostname ?? ''
        form.port = newConfig.port ?? '8000'
        form.path = newConfig.path ?? 'api/control_id_monitor/notifications/dao'
        form.request_timeout = newConfig.request_timeout ?? 5000
      }
    },
    { immediate: true },
  )

  function handleSave () {
    emit('save', { ...form })
  }

  function handleActivate () {
    emit('activate', { ...form })
  }
</script>

<template>
  <v-container>
    <v-alert
      class="mb-4"
      color="info"
      icon="mdi-information"
      prominent
      text="Configure o servidor que receberá as notificações do monitor em tempo real."
    />

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.hostname"
          hint="Ex: 192.168.1.100 ou monitor.empresa.com"
          label="Hostname/IP *"
          persistent-hint
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.port"
          hint="Porta do servidor"
          label="Porta"
          persistent-hint
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="form.path"
          hint="Caminho da API (sem / inicial)"
          label="Caminho da API"
          persistent-hint
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="form.request_timeout"
          hint="Tempo limite em milissegundos"
          label="Timeout de Requisição"
          persistent-hint
          type="number"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12" md="6">
        <v-btn block color="primary" :loading="saving" @click="handleSave">
          Salvar Configurações
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn
          block
          color="success"
          :loading="activating"
          prepend-icon="mdi-play"
          @click="handleActivate"
        >
          Ativar Monitor
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
