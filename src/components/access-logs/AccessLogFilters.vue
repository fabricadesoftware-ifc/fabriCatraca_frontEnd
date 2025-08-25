<template>
  <v-expansion-panels class="mb-6">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-filter</v-icon>
        Filtros Avançados
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              clearable
              density="compact"
              label="Buscar"
              placeholder="Usuário, dispositivo, portal..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.eventType"
              clearable
              density="compact"
              item-title="title"
              item-value="value"
              :items="eventTypes"
              label="Tipo de Evento"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.device"
              clearable
              density="compact"
              item-title="name"
              item-value="id"
              :items="devices"
              label="Dispositivo"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.portal"
              clearable
              density="compact"
              item-title="name"
              item-value="id"
              :items="portals"
              label="Portal"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.dateFrom"
              density="compact"
              label="Data Inicial"
              type="datetime-local"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.dateTo"
              density="compact"
              label="Data Final"
              type="datetime-local"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.user"
              clearable
              density="compact"
              item-title="name"
              item-value="id"
              :items="users"
              label="Usuário"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn
              block
              color="primary"
              :loading="loading"
              @click="$emit('apply', filters)"
            >
              Aplicar Filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
  import type { Device, Portal, User } from '@/types'
  import { ref } from 'vue'

  const props = defineProps<{
    devices: Device[]
    portals: Portal[]
    users: User[]
    loading: boolean
  }>()

  defineEmits<{
    (e: 'apply', filters: any): void
  }>()

  const filters = ref({
    search: '',
    eventType: null,
    device: null,
    portal: null,
    dateFrom: '',
    dateTo: '',
    user: null,
  })

  const eventTypes = [
    { title: 'Equipamento Inválido', value: 1 },
    { title: 'Parâmetros Inválidos', value: 2 },
    { title: 'Não Identificado', value: 3 },
    { title: 'Identificação Pendente', value: 4 },
    { title: 'Tempo Esgotado', value: 5 },
    { title: 'Acesso Negado', value: 6 },
    { title: 'Acesso Concedido', value: 7 },
    { title: 'Acesso Pendente', value: 8 },
    { title: 'Não é Administrador', value: 9 },
    { title: 'Acesso Não Identificado', value: 10 },
    { title: 'Acesso por Botoeira', value: 11 },
    { title: 'Acesso pela Interface Web', value: 12 },
    { title: 'Desistência', value: 13 },
    { title: 'Sem Resposta', value: 14 },
    { title: 'Acesso pela Interfonia', value: 15 },
  ]
</script>
