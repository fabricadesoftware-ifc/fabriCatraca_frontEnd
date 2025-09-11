import type { QueryParams, User } from '@/types'
import { defineStore } from 'pinia'
import { UsersService } from '@/services'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    selectedUser: null as User | null,
    loading: false,
    saving: false,
    current_page: 1,
    page_size: 10,
    count: 0,
    total_pages: 0,
  }),

  actions: {
    async loadUsers (params?: QueryParams) {
      this.loading = true
      try {
        const response = await UsersService.getUsers(params)
        this.current_page = response.current_page || 1
        this.page_size = response.page_size
        this.count = response.count
        this.total_pages = response.total_pages || 1
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
