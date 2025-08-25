<template>
  <v-card>
    <v-data-table
      class="elevation-1"
      :headers="headers"
      :items="accessRules"
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
            Nova Regra
          </v-btn>
        </v-toolbar>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon
            class="mr-3"
            :color="getRuleTypeColor(item.type)"
          >
            {{ getRuleTypeIcon(item.type) }}
          </v-icon>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ getRuleTypeLabel(item.type) }}
            </div>
          </div>
        </div>
      </template>

      <template #item.description="{ item }">
        <span class="text-body-2">
          {{ item.description || 'Sem descrição' }}
        </span>
      </template>

      <template #item.priority="{ item }">
        <v-chip
          :color="getPriorityColor(item.priority)"
          size="small"
          variant="tonal"
        >
          {{ item.priority }}
        </v-chip>
      </template>

      <template #item.type="{ item }">
        <v-chip
          :color="getRuleTypeColor(item.type)"
          size="small"
          variant="tonal"
        >
          {{ getRuleTypeLabel(item.type) }}
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
            <v-list-item @click="$emit('duplicate', item)">
              <v-list-item-title>
                <v-icon class="mr-2">mdi-content-copy</v-icon>
                Duplicar
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
  import type { AccessRule } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { ref } from 'vue'
  import { useAccessRule } from '@/composables/useAccessRule'

  const props = defineProps<{
    accessRules: AccessRule[]
    loading: boolean
  }>()

  defineEmits<{
    (e: 'add'): void
    (e: 'edit' | 'view' | 'duplicate' | 'delete' | 'toggle-status', rule: AccessRule): void
  }>()

  const {
    getRuleTypeColor,
    getRuleTypeIcon,
    getRuleTypeLabel,
    getPriorityColor,
  } = useAccessRule()

  const search = ref('')

  const headers: TableHeaders<AccessRule> = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Descrição', key: 'description', sortable: false },
    { title: 'Tipo', key: 'type', sortable: true },
    { title: 'Prioridade', key: 'priority', sortable: true, align: 'center' },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]
</script>
