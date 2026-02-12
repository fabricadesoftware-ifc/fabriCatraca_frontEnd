<script setup lang="ts">
  import type { User as BaseUser } from '@/types'
  import { ref, watch } from 'vue'
  import { toast } from 'vue3-toastify'
  import { useUserStore } from '@/stores'
  import UserDialog from './UserDialog.vue'

  interface User extends Omit<BaseUser, 'user_groups'> {
    user_groups?: (number | { id: number, name: string })[]
  }

  defineProps<{
    users: User[]
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
  }>()

  const emit = defineEmits<{
    (
      e: 'page-changed' | 'item-per-page' | 'search-changed',
      value: number | string,
    ): void
  }>()

  const userStore = useUserStore()
  const dialog = ref(false)
  const selectedUser = ref<User | null>(null)
  const selection = ref({
    selected: [] as User[],
  })
  const search = ref('')
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const headers = [
    { title: 'ID', key: 'id', align: 'start' as const },
    { title: 'Nome', key: 'name', align: 'start' as const },
    { title: 'Turma', key: 'user_groups', align: 'start' as const },
    { title: 'Matrícula', key: 'registration', align: 'start' as const },
  ]

  // Watch para debounce na pesquisa (aguarda 500ms após parar de digitar)
  watch(search, newSearch => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
      emit('search-changed', newSearch)
    }, 500)
  })

  // Debug para verificar se a seleção está funcionando

  async function salvarUsuario (user: User) {
    try {
      let savedUser: User

      if (user.id === 0) {
        // Criar novo usuário
        savedUser = await userStore.createUser({
          name: user.name,
          registration: user.registration,
          user_type_id: user.user_type_id,
        })

        // Para usuário novo, adicionar todos os grupos selecionados
        const userGroupIds = (user.user_groups || []).map(g =>
          typeof g === 'number' ? g : g.id,
        )
        for (const groupId of userGroupIds) {
          await userStore.addUserToGroup(savedUser.id, groupId)
        }
      } else {
        // Para usuário existente, verificar se dados básicos mudaram
        const currentUser = await userStore.getUserById(user.id)

        if (!currentUser) {
          throw new Error('Usuário não encontrado')
        }
        const basicDataChanged
          = currentUser.name !== user.name
            || currentUser.registration !== user.registration
            || currentUser.user_type_id !== user.user_type_id

        // Atualizar dados básicos apenas se mudaram
        savedUser = basicDataChanged
          ? await userStore.updateUser(user.id, {
            name: user.name,
            registration: user.registration,
            user_type_id: user.user_type_id,
          })
          : currentUser

        // Gerenciar grupos do usuário
        const userGroupIds = (user.user_groups || []).map(g =>
          typeof g === 'number' ? g : g.id,
        )
        const currentGroups
          = currentUser.user_groups?.map(g =>
            typeof g === 'number' ? g : g.id,
          ) || []

        const groupsToAdd = userGroupIds.filter(
          (groupId: number) => !currentGroups.includes(groupId),
        )
        const groupsToRemove = currentGroups.filter(
          (groupId: number) => !userGroupIds.includes(groupId),
        )

        // Adiciona novos grupos
        for (const groupId of groupsToAdd) {
          await userStore.addUserToGroup(user.id, groupId)
        }

        // Remove grupos
        for (const groupId of groupsToRemove) {
          await userStore.removeUserFromGroup(user.id, groupId)
        }
      }

      // Recarrega a lista de usuários
      await userStore.loadUsers({
        page: userStore.current_page,
        page_size: userStore.page_size,
      })
      toast.success('Usuário salvo com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar usuário. Por favor, tente novamente.')
    }
  }

  function showUserDetails (event: Event, { item }: { item: User }) {
    selectedUser.value = item
    dialog.value = true
  }

  async function removerSelecionados () {
    const selectedItems = selection.value.selected
    if (selectedItems.length === 0) return

    // Debug para verificar os IDs

    if (confirm(`Remover ${selectedItems.length} usuário(s)?`)) {
      try {
        // Filtrar apenas usuários com ID válido
        const validUsers = selectedItems.filter(
          user => typeof user.id === 'number' && !Number.isNaN(user.id),
        )
        if (validUsers.length === 0) {
          throw new Error('Nenhum usuário válido para remover')
        }

        // Deletar cada usuário selecionado
        await Promise.all(
          validUsers.map(user => userStore.deleteUser(user.id)),
        )
        // Recarregar a lista após deletar
        await userStore.loadUsers({
          page: userStore.current_page,
          page_size: userStore.page_size,
        })

        const removedCount = validUsers.length
        // Limpar seleção
        selection.value.selected = []
        toast.success(`${removedCount} usuário(s) removido(s) com sucesso!`)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao remover usuários. Por favor, tente novamente.')
      }
    }
  }

  function novoUsuario () {
    selectedUser.value = {
      id: 0,
      name: '',
      registration: '',
      user_groups: [],
      user_type_id: 1,
      devices: [],
      email: '',
    }
    dialog.value = true
  }

  function trocarPagina (page: number) {
    emit('page-changed', page)
  }

  function itemsPerPageChanged (newPageSize: number) {
    emit('item-per-page', newPageSize)
  }

  function onSelect (items: User[]) {
    // Garantir que temos um array
    const selectedItems = Array.isArray(items) ? items : [items].filter(Boolean)
    // Atualizar seleção apenas se tivermos itens válidos
    selection.value.selected
      = selectedItems.length > 0
        ? selectedItems.map(item => ({
          ...item,
          id: Number(item.id), // Garantir que o ID é um número
        }))
        : []
  }
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">Gerenciar Usuários</h2>

    <div>
      <!-- Debug visual (remova depois que funcionar) -->
      <span class="mr-2 text-caption">Selecionados: {{ selection.selected.length }}</span>

      <v-btn
        class="mr-2"
        color="error"
        :disabled="selection.selected.length === 0"
        prepend-icon="mdi-delete"
        @click="removerSelecionados"
      >
        Remover Selecionados
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="novoUsuario">
        Adicionar Usuário
      </v-btn>
    </div>
  </div>

  <!-- Campo de pesquisa -->
  <v-text-field
    v-model="search"
    append-inner-icon="mdi-magnify"
    class="mb-4"
    clearable
    density="comfortable"
    hide-details
    label="Pesquisar por nome ou matrícula"
    single-line
    variant="outlined"
  />

  <v-data-table-server
    v-model="selection.selected"
    class="rounded-lg"
    :headers="headers"
    hover
    item-key="id"
    :items="users"
    :items-length="totalItems ?? 0"
    :items-per-page="pageSize ?? 10"
    :loading="users.length === 0"
    :page="currentPage ?? 1"
    return-object
    select-strategy="all"
    show-select
    @click:row="showUserDetails"
    @update:items-per-page="itemsPerPageChanged"
    @update:page="trocarPagina"
    @update:selected="onSelect"
  >
    <!-- Template para user_groups -->
    <template #item.user_groups="{ item }">
      {{
        item.user_groups?.length
          ? typeof item.user_groups[0] === "object"
            ? item.user_groups[0].name
            : "Grupo " + item.user_groups[0]
          : "Não há grupo"
      }}
    </template>
  </v-data-table-server>

  <UserDialog v-model="dialog" :user="selectedUser" @save="salvarUsuario" />
</template>

<style scoped>
/* O Vuetify já cuida do hover quando você usa hover="true" */
.v-data-table >>> tbody tr {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
</style>
