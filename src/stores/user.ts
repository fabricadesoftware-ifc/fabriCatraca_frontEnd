import type { QueryParams, User } from '@/types'
import { defineStore } from 'pinia'
import { UsersService } from '@/services'
import userGroupsService from '@/services/user_groups'
import router from '@/router'

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
        router.go()
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
        router.go()
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

    async getUserById (id: number) {
      try {
        const response = await UsersService.getUserById(id)
        // Se a API retorna o usuário diretamente, não dentro de { data: ... }
        return response.data || response
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        throw error
      }
    },

    async addUserToGroup (userId: number, groupId: number) {
      try {
        await userGroupsService.createUserGroup({
          user: userId,
          group: groupId,
        } as any)
      } catch (error) {
        console.error('Erro ao adicionar usuário ao grupo:', error)
        throw error
      }
    },

    async removeUserFromGroup (userId: number, groupId: number) {
      try {
        const response = await userGroupsService.getUserGroups({ user: userId, group: groupId })
        if (response.results[0]) {
          await userGroupsService.deleteUserGroup(response.results[0].id)
        }
      } catch (error) {
        console.error('Erro ao remover usuário do grupo:', error)
        throw error
      }
    },
  },
})
