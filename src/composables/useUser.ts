import { ref } from 'vue'
import type { User, Device } from '@/types'
import { UsersService } from '@/services'

export function useUser() {
  // Estado
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  // Métodos
  const loadUsers = async () => {
    loading.value = true
    try {
      const response = await UsersService.getUsers()
      users.value = response.results
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data: Partial<User>) => {
    saving.value = true
    try {
      const response = await UsersService.createUser(data)
      await loadUsers()
      return response.data
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateUser = async (id: number, data: Partial<User>) => {
    saving.value = true
    try {
      const response = await UsersService.updateUser(id, data)
      await loadUsers()
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await UsersService.deleteUser(id)
      await loadUsers()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      throw error
    }
  }

  // Helpers
  const getUserTypeColor = (userTypeId: number) => {
    const colors: Record<number, string> = {
      1: 'primary', // Aluno
      2: 'success', // Professor
      3: 'warning', // Funcionário
      4: 'error', // Administrador
    }
    return colors[userTypeId] || 'grey'
  }

  const getUserTypeLabel = (userTypeId: number) => {
    const types: Record<number, string> = {
      1: 'Aluno',
      2: 'Professor',
      3: 'Funcionário',
      4: 'Administrador',
    }
    return types[userTypeId] || 'Desconhecido'
  }

  return {
    // Estado
    users,
    selectedUser,
    loading,
    saving,

    // Métodos
    loadUsers,
    createUser,
    updateUser,
    deleteUser,

    // Helpers
    getUserTypeColor,
    getUserTypeLabel,
  }
}
