<template>
  <v-card>
    <v-data-table
      class="elevation-1"
      :headers="headers"
      :items="groups"
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
            Novo Grupo
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-avatar
            class="mr-3"
            color="primary"
            size="32"
          >
            <span class="text-caption font-weight-bold">
              {{ item.name.charAt(0).toUpperCase() }}
            </span>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">
              ID: {{ item.id }}
            </div>
          </div>
        </div>
      </template>

      <template #item.description="{ item }">
        <span class="text-body-2">
          {{ item.description || 'Sem descrição' }}
        </span>
      </template>

      <template #item.member_count="{ item }">
        <v-chip
          :color="(item.member_count || 0) > 0 ? 'primary' : 'grey'"
          size="small"
          variant="tonal"
        >
          {{ item.member_count || 0 }} membros
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
          icon="mdi-account-group"
          size="small"
          variant="text"
          @click="$emit('manage-members', item)"
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
  import type { Group } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { ref } from 'vue'

  defineProps<{
    groups: Group[]
    loading: boolean
  }>()

  defineEmits<{
    (e: 'add'): void
    (e: 'edit' | 'delete' | 'toggle-status' | 'manage-members', group: Group): void
  }>()

  const search = ref('')

  const headers: TableHeaders<Group> = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Descrição', key: 'description', sortable: false },
    { title: 'Membros', key: 'member_count', sortable: true, align: 'center' },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]
</script>
