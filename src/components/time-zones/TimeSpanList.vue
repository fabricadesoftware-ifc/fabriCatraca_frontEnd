<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
  >
    <v-card>
      <v-card-title class="text-h5">
        Períodos de Acesso: {{ timeZone?.name }}
      </v-card-title>

      <v-card-text>
        <v-data-table
          class="elevation-1"
          :headers="headers"
          :items="timeZone?.time_spans || []"
          :loading="loading"
        >
          <template #top>
            <v-toolbar flat>
              <v-spacer />
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="$emit('add-span')"
              >
                Novo Período
              </v-btn>
            </v-toolbar>
          </template>

          <template #item.days="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="(enabled, day) in getDays(item)"
                :key="day"
                :color="enabled ? getDayColor(getDayNumber(day)) : 'grey'"
                size="x-small"
                :variant="enabled ? 'elevated' : 'outlined'"
              >
                {{ getDayShortLabel(getDayNumber(day)) }}
              </v-chip>
            </div>
          </template>

          <template #item.start="{ item }">
            <span class="font-weight-medium">
              {{ formatTime(item.start) }}
            </span>
          </template>

          <template #item.end="{ item }">
            <span class="font-weight-medium">
              {{ formatTime(item.end) }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              class="mr-2"
              color="warning"
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="$emit('edit-span', item)"
            />
            <v-btn
              color="error"
              icon="mdi-delete"
              size="small"
              variant="text"
              @click="$emit('delete-span', item)"
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
  import type { TimeSpan, TimeZone } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { computed } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    timeZone?: TimeZone
    loading: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'add-span'): void
    (e: 'edit-span' | 'delete-span', timeSpan: TimeSpan): void
  }>()

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  // Headers da tabela
  const headers: TableHeaders<TimeSpan> = [
    { title: 'Dias', key: 'days', sortable: false },
    { title: 'Início', key: 'start', sortable: true },
    { title: 'Fim', key: 'end', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  // Helpers
  const getDays = (timeSpan: TimeSpan) => ({
    sun: timeSpan.sun,
    mon: timeSpan.mon,
    tue: timeSpan.tue,
    wed: timeSpan.wed,
    thu: timeSpan.thu,
    fri: timeSpan.fri,
    sat: timeSpan.sat,
  })

  const getDayNumber = (day: string): number => {
    const days = { sun: 1, mon: 2, tue: 3, wed: 4, thu: 5, fri: 6, sat: 7 }
    return days[day as keyof typeof days] || 0
  }

  const getDayShortLabel = (day: number): string => {
    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return labels[day - 1] || '?'
  }

  const getDayColor = (day: number): string => {
    const colors = ['error', 'primary', 'primary', 'primary', 'primary', 'primary', 'warning']
    return colors[day - 1] || 'grey'
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }
</script>
