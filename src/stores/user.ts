import type { User } from '@/types'
import { defineStore } from 'pinia'
import { useUIState } from '@/composables/useUIState'
import { UsersService } from '@/services'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    selectedUser: null as User | null,
    loading: false,
    saving: false,
  }),

  actions: {
    async loadUsers () {
      this.loading = true
      try {
        const response = await UsersService.getUsers()
        this.users = response.results
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser (data: Partial<User>) {
      this.saving = true
      try {
        const response = await UsersService.createUser(data)
        this.users.push(response.data)
        return response.data
      } catch (error) {
        console.error('Erro ao criar usuário:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateUser (id: number, data: Partial<User>) {
      this.saving = true
      try {
        const response = await UsersService.updateUser(id, data)
        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteUser (id: number) {
      this.saving = true
      try {
        await UsersService.deleteUser(id)
        this.users = this.users.filter(u => u.id !== id)
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})

