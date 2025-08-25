<template>
  <v-card>
    <v-data-table
      class="elevation-1"
      :headers="headers"
      :items="portals"
      :items-per-page="10"
      :items-per-page-options="[5, 10, 25, 50]"
      :loading="loading"
      :search="search"
    >
      <template #top>
        <v-toolbar flat>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            class="mx-4"
            density="compact"
            hide-details
            label="Buscar"
            single-line
          />
          <v-spacer />
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="$emit('add')"
          >
            Novo Portal
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon
            class="mr-2"
            :color="getPortalTypeColor(item.type || '')"
          >
            {{ getPortalTypeIcon(item.type || '') }}
          </v-icon>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.description || 'Sem descrição' }}
            </div>
          </div>
        </div>
      </template>

      <template #item.area="{ item }">
        <v-chip
          v-if="item.area"
          :color="getAreaColor(item.area.id)"
          size="small"
          variant="tonal"
        >
          {{ item.area.name }}
        </v-chip>
        <span
          v-else
          class="text-caption text-medium-emphasis"
        >
          Sem área definida
        </span>
      </template>

      <template #item.devices="{ item }">
        <div class="d-flex flex-column gap-1">
          <v-chip
            v-for="device in item.devices"
            :key="device.id"
            :color="getDeviceStatusColor(device.status || '')"
            size="small"
            variant="tonal"
          >
            {{ device.name }}
          </v-chip>
          <span
            v-if="!item.devices || item.devices.length === 0"
            class="text-caption text-medium-emphasis"
          >
            Nenhum dispositivo
          </span>
        </div>
      </template>

      <template #item.is_active="{ item }">
        <v-switch
          v-model="item.is_active"
          density="compact"
          hide-details
          :loading="item.updating"
          @change="$emit('toggle-status', item)"
        />
      </template>

      <template #item.actions="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item @click="$emit('edit', item)">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-pencil</v-icon>
                Editar
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('view', item)">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-eye</v-icon>
                Ver Detalhes
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('manage-devices', item)">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-devices</v-icon>
                Gerenciar Dispositivos
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('manage-rules', item)">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-shield-account</v-icon>
                Regras de Acesso
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('delete', item)">
              <v-list-item-title class="text-error">
                <v-icon class="mr-2">mdi-delete</v-icon>
                Excluir
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
  import type { Portal } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { ref } from 'vue'
  import { useArea } from '@/composables/useArea'
  import { useDevice } from '@/composables/useDevice'
  import { usePortal } from '@/composables/usePortal'

  const props = defineProps<{
    portals: Portal[]
    loading: boolean
  }>()

  defineEmits<{
    (e: 'add'): void
    (e: 'edit' | 'view' | 'manage-devices' | 'manage-rules' | 'delete' | 'toggle-status', portal: Portal): void
  }>()

  const { getPortalTypeColor, getPortalTypeIcon } = usePortal()
  const { getAreaColor } = useArea()
  const { getDeviceStatusColor } = useDevice()

  const search = ref('')

  const headers: TableHeaders<Portal> = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Área', key: 'area', sortable: true },
    { title: 'Dispositivos', key: 'devices', sortable: false },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]
</script>
