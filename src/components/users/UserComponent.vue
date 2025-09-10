<script lang="ts" setup>
  import { ref } from 'vue'

  interface User {
    id: number
    name: string
    user_groups?: string[]
    registration?: string
  }

  defineProps<{
    users: User[]
    currentPage?: number
    pageSize?: number
    totalPages?: number
  }>()

  const dialog = ref(false)
  const selectedUser = ref<User | null>(null)

  const showUserDetails = (user: User) => {
    selectedUser.value = user
    dialog.value = true
  }
</script>
<template>
  <div>
    <v-data-table-server
      :headers="[
        { title: 'ID', key: 'id', align: 'start' },
        { title: 'Nome', key: 'name', align: 'start' },
        { title: 'Turma', key: 'user_groups', align: 'start' },
        { title: 'Matricula', key: 'registration', align: 'start' }
      ]"
      :items="users"
      :items-length="users.length"
      :items-per-page="pageSize || 10"
      :page="currentPage || 1"
    />

    <v-dialog v-model="dialog" max-width="500">
      <v-card v-if="selectedUser">
        <v-card-title class="text-h5">
          Detalhes do Usuário
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>ID:</v-list-item-title>
              <v-list-item-subtitle>{{ selectedUser.id }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Nome:</v-list-item-title>
              <v-list-item-subtitle>{{ selectedUser.name }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Turma:</v-list-item-title>
              <v-list-item-subtitle>{{ selectedUser.user_groups?.length ? selectedUser.user_groups[0] : 'Não há grupo'  }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Matrícula:</v-list-item-title>
              <v-list-item-subtitle>{{ selectedUser.registration }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="text"
            @click="dialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
