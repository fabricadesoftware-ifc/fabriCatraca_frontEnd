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
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
  }>()

  const emit = defineEmits<{
    (e: 'page-changed' | 'item-per-page', value: number): void
  }>()

  const dialog = ref(false)
  const selectedUser = ref<User | null>(null)

  const showUserDetails = (user: User) => {
    selectedUser.value = user
    dialog.value = true
  }

  async function trocarPagina (page: number) {
    // Emitir evento para o componente pai
    emit('page-changed', page)
  }
  async function itemsPerPageChanged (newPageSize: number) {
    // Emitir evento para o componente pai
    emit('item-per-page', newPageSize) // Resetar para a primeira página
  }
</script>
<template>
  <v-data-table-server
    class="rounded-lg"
    :headers="[
      { title: 'ID', key: 'id', align: 'start' },
      { title: 'Nome', key: 'name', align: 'start' },
      { title: 'Turma', key: 'user_groups', align: 'start' },
      { title: 'Matricula', key: 'registration', align: 'start' }
    ]"
    :items="users"
    :items-length="totalItems ?? 0"
    :items-per-page="pageSize ?? 10"
    :loading="users.length === 0"
    :page="currentPage ?? 1"
    @update:items-per-page="itemsPerPageChanged"
    @update:page="trocarPagina"
  >
    <!-- Slot que substitui as linhas -->
    <template #item="{ item }">
      <tr class="cursor-pointer" @click="showUserDetails(item)">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.user_groups?.length ? item.user_groups[0] : 'Não há grupo' }}</td>
        <td>{{ item.registration }}</td>
      </tr>
    </template>
  </v-data-table-server>

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
            <v-list-item-subtitle>{{ selectedUser.user_groups?.length ? selectedUser.user_groups[0] : 'Não há grupo' }}</v-list-item-subtitle>
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
</template>
<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: 0.3s ease-in-out;
}

.cursor-pointer:hover {
  background-color: #f5f5f517;
}

</style>
