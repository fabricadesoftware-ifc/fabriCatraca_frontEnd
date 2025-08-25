<template>
  <v-card>
    <v-data-table
      class="elevation-0"
      :headers="headers"
      :items="areas"
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
            color="primary"
            prepend-icon="mdi-plus"
            @click="$emit('add')"
          >
            Nova Área
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon
            class="mr-2"
            :color="getAreaColor(item.id)"
          >
            mdi-map-marker
          </v-icon>
          <div class="font-weight-medium">{{ item.name }}</div>
        </div>
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
  import type { Area } from '@/types'
  import { ref } from 'vue'
  import { useArea } from '@/composables/useArea'

  const props = defineProps<{
    areas: Area[]
    loading: boolean
  }>()

  defineEmits<{
    (e: 'add'): void
    (e: 'edit' | 'view' | 'delete', area: Area): void
  }>()

  const { getAreaColor } = useArea()

  const search = ref('')

  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, width: '150px' },
  ]
</script>
