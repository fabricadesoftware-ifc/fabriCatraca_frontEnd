<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
  >
    <v-card>
      <v-card-title class="text-h5">
        Dispositivos do Portal: {{ portal?.name }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-btn
              class="mb-4"
              color="primary"
              prepend-icon="mdi-plus"
              @click="$emit('add-device')"
            >
              Adicionar Dispositivo
            </v-btn>
          </v-col>
        </v-row>

        <v-data-table
          class="elevation-1"
          :headers="headers"
          :items="portal?.devices || []"
          :loading="loading"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-icon
                class="mr-3"
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
              variant="tonal"
            >
              {{ getDeviceStatusLabel(item.status || '') }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              color="error"
              icon="mdi-delete"
              size="small"
              variant="text"
              @click="$emit('remove-device', item)"
            />
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="dialog = false"
        >
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Device, Portal } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { computed } from 'vue'
  import { useDevice } from '@/composables/useDevice'

  const props = defineProps<{
    modelValue: boolean
    portal?: Portal
    loading: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'add-device'): void
    (e: 'remove-device', device: Device): void
  }>()

  const { getDeviceStatusColor, getDeviceStatusLabel } = useDevice()

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const headers: TableHeaders<Device> = [
    { title: 'Dispositivo', key: 'name', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]
</script>
