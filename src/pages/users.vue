<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Usuários</h1>
        </div>
      </v-col>
    </v-row>

    <UserList
      :loading="loading"
      :users="users"
      @add="openUserDialog()"
      @delete="deleteUser"
      @edit="editUser"
      @view="viewUser"
    />

    <UserForm
      v-model="userDialog"
      :available-devices="availableDevices"
      :saving="saving"
      :user="editingUser"
      @save="saveUser"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { User } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import UserForm from '@/components/users/UserForm.vue'
  import UserList from '@/components/users/UserList.vue'
  import { useDevice } from '@/composables/useDevice'
  import { useUser } from '@/composables/useUser'

  // Componentes

  // Composables
  const {
    users,
    loading,
    saving,
    loadUsers,
    createUser,
    updateUser,
    deleteUser: removeUser,
  } = useUser()

  const {
    devices: availableDevices,
    loading: loadingDevices,
    loadDevices,
  } = useDevice()

  // Estado local
  const userDialog = ref(false)
  const editingUser = ref<User | undefined>()

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos
  const openUserDialog = (user?: User) => {
    editingUser.value = user
    userDialog.value = true
  }

  const editUser = (user: User) => {
    openUserDialog(user)
  }

  const viewUser = (user: User) => {
    // TODO: Implementar visualização detalhada
    console.log('Visualizar usuário:', user)
  }

  const saveUser = async (data: Partial<User>) => {
    try {
      if (editingUser.value) {
        await updateUser(editingUser.value.id, data)
        showSnackbar('Usuário atualizado com sucesso')
      } else {
        await createUser(data)
        showSnackbar('Usuário criado com sucesso')
      }
      userDialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar usuário', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deleteUser = async (user: User) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) return

    try {
      await removeUser(user.id)
      showSnackbar('Usuário excluído com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir usuário', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  // Helpers
  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadUsers()
    loadDevices()
  })
</script>
