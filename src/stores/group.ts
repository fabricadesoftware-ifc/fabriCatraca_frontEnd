import type { Group, User } from '@/types'
import { defineStore } from 'pinia'
import { useUIState } from '@/composables/useUIState'
import groupAccessRulesService from '@/services/group_access_rules'
import groupsService from '@/services/groups'
import userGroupsService from '@/services/user_groups'

export const useGroupStore = defineStore('group', {
  state: () => ({
    groups: [] as Group[],
    selectedGroup: null as Group | null,
    loading: false,
    saving: false,
    loadingMembers: false,
    current_page: 1,
    page_size: 10,
    count: 0,
    total_pages: 0,
  }),

  actions: {
    async loadGroups (params?: any) {
      const { adaptGroup } = useUIState()
      this.loading = true
      try {
        const response = await groupsService.getGroups(params)
        this.current_page = response.current_page || 1
        this.page_size = response.page_size
        this.count = response.count
        this.total_pages = response.total_pages || 1
        this.groups = response.results.map(group => adaptGroup(group))
      } catch (error) {
        console.error(error)
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
        console.error(error)
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
        console.error(error)
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
        console.error(error)
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
        console.error(error)
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
        console.error(error)
        throw error
      } finally {
        this.loadingMembers = false
      }
    },

    isUserInGroup (user: User, group: Group) {
      return group.users?.some(u => u.id === user.id) || false
    },

    async getGroupById (id: number) {
      try {
        const response = await groupsService.getGroupById(id)
        return response.data || response
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    async addAccessRuleToGroup (groupId: number, accessRuleId: number) {
      try {
        await groupAccessRulesService.createGroupAccessRule({
          group_id: groupId,
          access_rule_id: accessRuleId,
        })
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    async removeAccessRuleFromGroup (groupId: number, accessRuleId: number) {
      try {
        // Buscar a relação específica e deletar pelo ID do recurso
        const response = await groupAccessRulesService.getGroupAccessRules({ group_id: groupId, access_rule_id: accessRuleId })
        const relation = (response.results || []).find((rel: any) => (
          (rel?.group?.id ?? rel?.group_id) === groupId
          && (rel?.access_rule?.id ?? rel?.access_rule_id) === accessRuleId
        ))
        if (relation?.id != null) {
          await groupAccessRulesService.deleteGroupAccessRule(relation.id)
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    },
  },
})
