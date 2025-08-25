<template>
  <v-card>
    <v-data-table
      class="elevation-0"
      :headers="headers"
      :items="devices"
      :items-per-page="10"
      :items-per-page-options="[10, 25, 50, 100]"
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
            class="mr-2"
            color="secondary"
            :loading="syncing"
            prepend-icon="mdi-sync"
            variant="outlined"
            @click="$emit('sync')"
          >
            Sincronizar
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="$emit('add')"
          >
            Nova Catraca
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon
            class="mr-2"
            :color="getDeviceStatusColor(item.status || '')"
          >
            mdi-door-open
          </v-icon>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.ip }}
            </div>
          </div>
        </div>
      </template>

      <template #item.status="{ item }">
        <v-chip
          :color="getDeviceStatusColor(item.status || '')"
          size="small"
        >
          {{ getDeviceStatusLabel(item.status || '') }}
        </v-chip>
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

      <template #item.is_default="{ item }">
        <v-chip
          :color="item.is_default ? 'primary' : 'grey'"
          size="small"
          variant="outlined"
        >
          {{ item.is_default ? 'Padrão' : 'Secundário' }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          class="mr-2"
          color="info"
          icon="mdi-eye"
          size="small"
          variant="text"
          @click="$emit('view', item)"
        />
        <v-btn
          class="mr-2"
          color="warning"
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="$emit('edit', item)"
        />
        <v-btn
          class="mr-2"
          color="success"
          icon="mdi-wifi"
          size="small"
          variant="text"
          @click="$emit('test', item)"
        />
        <v-btn
          color="error"
          icon="mdi-delete"
          size="small"
          variant="text"
          @click="$emit('delete', item)"
        />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
  import type { Device } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { ref } from 'vue'
  import { useDevice } from '@/composables/useDevice'

  const props = defineProps<{
    devices: Device[]
    loading: boolean
    syncing: boolean
  }>()

  defineEmits<{
    (e: 'add' | 'sync'): void
    (e: 'edit' | 'view' | 'test' | 'delete' | 'toggle-status', device: Device): void
  }>()

  const { getDeviceStatusColor, getDeviceStatusLabel } = useDevice()

  const search = ref('')

  const headers: TableHeaders<Device> = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Padrão', key: 'is_default', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center', width: '200px' },
  ]
</script>
