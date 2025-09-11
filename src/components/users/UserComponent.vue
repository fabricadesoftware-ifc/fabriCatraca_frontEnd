<script lang="ts" setup>
  import { ref } from 'vue'
  import UserDialog from './UserDialog.vue'

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
  const selected = ref<User[]>([])

  const headers = [
    { title: 'ID', key: 'id', align: 'start' },
    { title: 'Nome', key: 'name', align: 'start' },
    { title: 'Turma', key: 'user_groups', align: 'start' },
    { title: 'Matrícula', key: 'registration', align: 'start' }
  ]

  function salvarUsuario (user: User) {
    console.log('Usuário salvo:', user)
    // aqui você pode chamar sua store/API
  }

  function showUserDetails (user: User) {
    selectedUser.value = user
    dialog.value = true
  }

  function removerSelecionados () {
    if (confirm(`Remover ${selected.value.length} usuário(s)?`)) {
      console.log('Removendo:', selected.value)
      // aqui chama sua API / store para deletar
      selected.value = [] // limpa seleção após remover
    }
  }

  function novoUsuario () {
    selectedUser.value = { id: 0, name: '', registration: '', user_groups: [] }
    dialog.value = true
  }

  function trocarPagina (page: number) {
    emit('page-changed', page)
  }

  function itemsPerPageChanged(newPageSize: number) {
    emit('item-per-page', newPageSize)
  }
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">Gerenciar Usuários</h2>

    <div>
      <v-btn
        class="mr-2"
        color="error"
        :disabled="!selected.length"
        prepend-icon="mdi-delete"
        @click="removerSelecionados"
      >
        Remover Selecionados
      </v-btn>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="novoUsuario"
      >
        Adicionar Usuário
      </v-btn>
    </div>
  </div>

  <v-data-table-server
    v-model:selected="selected"
    class="rounded-lg"
    :headers="headers.map(h => ({
      ...h,
      align: h.align as 'start' | 'end' | 'center'
    }))"
    :items="users"
    :items-length="totalItems ?? 0"
    :items-per-page="pageSize ?? 10"
    :loading="users.length === 0"
    :page="currentPage ?? 1"
    show-select
    @update:items-per-page="itemsPerPageChanged"
    @update:page="trocarPagina"
  >
    <template #item.data-table-select="{ isSelected, toggleSelect }">
      <v-checkbox
        density="compact"
        hide-details
        :model-value="isSelected"
        @update:model-value="toggleSelect"
      />
    </template>

    <template #item="{ item }">
      <tr class="cursor-pointer" @click="showUserDetails(item)">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.user_groups?.length ? item.user_groups[0] : 'Não há grupo' }}</td>
        <td>{{ item.registration }}</td>
      </tr>
    </template>
  </v-data-table-server>

  <UserDialog
    v-model="dialog"
    :user="selectedUser"
    @save="salvarUsuario"
  />
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
