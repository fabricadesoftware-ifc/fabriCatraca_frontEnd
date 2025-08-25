<template>
  <v-card>
    <v-data-table
      class="elevation-1"
      :headers="headers"
      :items="timeZones"
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
            Novo Fuso Horário
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon
            class="mr-2"
            :color="item.is_active ? 'success' : 'error'"
          >
            {{ item.is_active ? 'mdi-clock' : 'mdi-clock-off' }}
          </v-icon>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.description || 'Sem descrição' }}
            </div>
          </div>
        </div>
      </template>

      <template #item.time_spans="{ item }">
        <v-chip
          v-if="item.time_spans?.length"
          color="primary"
          size="small"
        >
          {{ item.time_spans.length }} períodos
        </v-chip>
        <v-chip
          v-else
          color="error"
          size="small"
        >
          Sem períodos
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

      <template #item.actions="{ item }">
        <v-btn
          class="mr-2"
          color="primary"
          icon="mdi-clock-edit"
          size="small"
          variant="text"
          @click="$emit('manage-spans', item)"
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
  import type { TimeZone } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { ref } from 'vue'

  defineProps<{
    timeZones: TimeZone[]
    loading: boolean
  }>()

  defineEmits<{
    (e: 'add'): void
    (e: 'edit' | 'delete' | 'toggle-status' | 'manage-spans', timeZone: TimeZone): void
  }>()

  const search = ref('')

  const headers: TableHeaders<TimeZone> = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Períodos', key: 'time_spans', sortable: true, align: 'center' },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]
</script>
