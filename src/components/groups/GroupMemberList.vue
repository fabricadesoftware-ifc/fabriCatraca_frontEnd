<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
  >
    <v-card>
      <v-card-title class="text-h5">
        Membros do Grupo: {{ group?.name }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="search"
              clearable
              density="compact"
              label="Buscar usuários..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-data-table
          class="elevation-1"
          :headers="headers"
          :items="users"
          :items-per-page="10"
          :loading="loading"
          :search="search"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                class="mr-3"
                color="secondary"
                size="32"
              >
                <span class="text-caption font-weight-bold">
                  {{ item.name.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.email }}
                </div>
              </div>
            </div>
          </template>

          <template #item.user_type_id="{ item }">
            <v-chip
              :color="getUserTypeColor(item.user_type_id)"
              size="small"
              variant="tonal"
            >
              {{ getUserTypeLabel(item.user_type_id) }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              :color="isUserInGroup(item, props.group!) ? 'error' : 'primary'"
              size="small"
              :variant="isUserInGroup(item, props.group!) ? 'outlined' : 'elevated'"
              @click="$emit('toggle-member', item)"
            >
              {{ isUserInGroup(item, props.group!) ? 'Remover' : 'Adicionar' }}
            </v-btn>
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
  import type { Group, User } from '@/types'
  import type { TableHeaders } from '@/types/vuetify'
  import { computed, ref } from 'vue'
  import { useGroup } from '@/composables/useGroup'
  import { useUser } from '@/composables/useUser'

  const props = defineProps<{
    modelValue: boolean
    group?: Group
    users: User[]
    loading: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'toggle-member', user: User): void
  }>()

  const { getUserTypeColor, getUserTypeLabel } = useUser()
  const { isUserInGroup } = useGroup()

  const search = ref('')

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const headers: TableHeaders<User> = [
    { title: 'Usuário', key: 'name', sortable: true },
    { title: 'Tipo', key: 'user_type_id', sortable: true },
    { title: 'Status', key: 'is_active', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]
</script>
