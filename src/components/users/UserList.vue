<template>
  <v-card>
    <v-data-table
      class="elevation-0"
      :headers="headers"
      :items="users"
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
            Novo Usuário
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-avatar
            class="mr-3"
            :color="getUserTypeColor(item.user_type_id)"
            size="32"
          >
            <span class="text-caption font-weight-bold">
              {{ item.name.charAt(0).toUpperCase() }}
            </span>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.registration }}
            </div>
          </div>
        </div>
      </template>

      <template #item.user_type_id="{ item }">
        <v-chip
          :color="getUserTypeColor(item.user_type_id)"
          size="small"
        >
          {{ getUserTypeLabel(item.user_type_id) }}
        </v-chip>
      </template>

      <template #item.devices="{ item }">
        <v-chip
          v-for="device in item.devices?.slice(0, 2)"
          :key="typeof device === 'number' ? device : device.id"
          class="mr-1"
          size="small"
          variant="outlined"
        >
          {{ typeof device === 'number' ? device : device.name }}
        </v-chip>
        <v-chip
          v-if="item.devices?.length > 2"
          color="grey"
          size="small"
          variant="outlined"
        >
          +{{ item.devices.length - 2 }}
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
  import type { User } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { ref } from 'vue'
  import { useUser } from '@/composables/useUser'

  const props = defineProps<{
    users: User[]
    loading: boolean
  }>()

  defineEmits<{
    (e: 'add'): void
    (e: 'edit' | 'view' | 'delete', user: User): void
  }>()

  const { getUserTypeColor, getUserTypeLabel } = useUser()

  const search = ref('')

  const headers: TableHeaders<User> = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Tipo', key: 'user_type_id', sortable: true },
    { title: 'Dispositivos', key: 'devices', sortable: false },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center', width: '150px' },
  ]
  </script>
