import type { Group, User } from '@/types'
import { defineStore } from 'pinia'
import { useUIState } from '@/composables/useUIState'
import groupsService from '@/services/groups'
import userGroupsService from '@/services/user_groups'

export const useGroupStore = defineStore('group', {
  state: () => ({
    groups: [] as Group[],
    selectedGroup: null as Group | null,
    loading: false,
    saving: false,
    loadingMembers: false,
  }),

  actions: {
    async loadGroups () {
      const { adaptGroup } = useUIState()
      this.loading = true
      try {
        const response = await groupsService.getGroups()
        this.groups = response.results.map(group => adaptGroup(group))
      } catch (error) {
        console.error('Erro ao carregar grupos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createGroup (data: Partial<Group>) {
      this.saving = true
      try {
        const response = await groupsService.createGroup(data)
        this.groups.push(response.data)
        return response.data
      } catch (error) {
        console.error('Erro ao criar grupo:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateGroup (id: number, data: Partial<Group>) {
      this.saving = true
      try {
        const response = await groupsService.updateGroup(id, data)
        const index = this.groups.findIndex(g => g.id === id)
        if (index !== -1) {
          this.groups[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar grupo:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteGroup (id: number) {
      this.saving = true
      try {
        await groupsService.deleteGroup(id)
        this.groups = this.groups.filter(g => g.id !== id)
      } catch (error) {
        console.error('Erro ao excluir grupo:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async addUserToGroup (userId: number, groupId: number) {
      this.loadingMembers = true
      try {
        await userGroupsService.createUserGroup({
          user: userId,
          group: groupId,
        })
        if (this.selectedGroup?.id === groupId) {
          const response = await groupsService.getGroupById(groupId)
          this.selectedGroup = response.data
        }
      } catch (error) {
        console.error('Erro ao adicionar usuário ao grupo:', error)
        throw error
      } finally {
        this.loadingMembers = false
      }
    },

    async removeUserFromGroup (groupId: number, userId: number) {
      this.loadingMembers = true
      try {
        const response = await userGroupsService.getUserGroups({ user: userId, group: groupId })
        console.log(response.results)
        if (response.results[0]) {
          await userGroupsService.deleteUserGroup(response.results[0].id)
        }
      } catch (error) {
        console.error('Erro ao remover usuário do grupo:', error)
        throw error
      } finally {
        this.loadingMembers = false
      }
    },

    isUserInGroup (user: User, group: Group) {
      return group.users?.some(u => u.id === user.id) || false
    },
  },
})
