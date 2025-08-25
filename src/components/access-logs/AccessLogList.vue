<template>
  <v-card>
    <v-data-table
      class="elevation-0"
      :headers="headers"
      hide-default-footer
      :items="logs"
      :items-per-page="itemsPerPage"
      :loading="loading"
    >
      <template #top>
        <v-toolbar flat>
          <v-spacer />
          <v-btn
            class="mr-2"
            color="secondary"
            :loading="exporting"
            prepend-icon="mdi-download"
            variant="outlined"
            @click="$emit('export')"
          >
            Exportar
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            prepend-icon="mdi-refresh"
            @click="$emit('refresh')"
          >
            Atualizar
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.time="{ item }">
        <div class="text-caption">
          {{ formatDateTime(item.time) }}
        </div>
      </template>

      <template #item.event_type="{ item }">
        <v-chip
          :color="getEventTypeColor(item.event_type)"
          size="small"
        >
          {{ getEventTypeLabel(item.event_type) }}
        </v-chip>
      </template>

      <template #item.user="{ item }">
        <div v-if="item.user">
          <div class="font-weight-medium">{{ item.user.name }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.user.registration }}
          </div>
        </div>
        <span v-else class="text-medium-emphasis">N/A</span>
      </template>

      <template #item.device="{ item }">
        <div v-if="item.device">
          <div class="font-weight-medium">{{ item.device.name }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.device.ip }}
          </div>
        </div>
        <span v-else class="text-medium-emphasis">N/A</span>
      </template>

      <template #item.portal="{ item }">
        <div v-if="item.portal">
          <div class="font-weight-medium">{{ item.portal.name }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.portal.area_from?.name }} → {{ item.portal.area_to?.name }}
          </div>
        </div>
        <span v-else class="text-medium-emphasis">N/A</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          color="info"
          icon="mdi-eye"
          size="small"
          variant="text"
          @click="$emit('view', item)"
        />
      </template>

      <template #bottom>
        <div class="d-flex justify-center align-center pa-4 flex-column">
          <div class="d-flex justify-center align-center">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(totalLogs / itemsPerPage)"
              rounded="circle"
              :total-visible="7"
              @update:model-value="$emit('page-change', $event)"
            />
          </div>
          <div class="d-flex align-center mt-2">
            <span class="text-caption mr-2">Itens por página:</span>
            <v-select
              v-model="itemsPerPage"
              class="items-per-page-select"
              density="compact"
              hide-details
              :items="[10, 20, 50, 100]"
              style="max-width: 100px;"
              variant="outlined"
              @update:model-value="$emit('items-per-page-change', $event)"
            />
            <span class="text-caption ml-4">
              Total: {{ totalLogs }} itens
            </span>
          </div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
  import type { AccessLogs } from '@/types'
  import { ref } from 'vue'
  import { useAccessLog } from '@/composables/useAccessLog'

  const props = defineProps<{
    logs: AccessLogs[]
    loading: boolean
    exporting: boolean
    totalLogs: number
  }>()

  defineEmits<{
    (e: 'export' | 'refresh'): void
    (e: 'view', log: AccessLogs): void
    (e: 'page-change' | 'items-per-page-change', value: number): void
  }>()

  const {
    getEventTypeColor,
    getEventTypeLabel,
    formatDateTime,
  } = useAccessLog()

  const currentPage = ref(1)
  const itemsPerPage = ref(20)

  const headers = [
    { title: 'Data/Hora', key: 'time', sortable: true, width: '150px' },
    { title: 'Tipo', key: 'event_type', sortable: true, width: '120px' },
    { title: 'Usuário', key: 'user', sortable: true, width: '200px' },
    { title: 'Dispositivo', key: 'device', sortable: true, width: '180px' },
    { title: 'Portal', key: 'portal', sortable: true, width: '200px' },
    { title: 'Ações', key: 'actions', sortable: false, width: '80px' },
  ]
</script>
