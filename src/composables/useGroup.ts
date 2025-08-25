import { ref } from 'vue'
import type { Group, User } from '@/types'
import groupsService from '@/services/groups'
import { useUIState } from './useUIState'
import userGroupsService from '@/services/user_groups'

export function useGroup() {
  // Estado
  const groups = ref<Group[]>([])
  const selectedGroup = ref<Group | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const loadingMembers = ref(false)

  // Métodos
  const { adaptGroup } = useUIState()

  const loadGroups = async () => {
    loading.value = true
    try {
      const response = await groupsService.getGroups()
      groups.value = response.results.map(group => adaptGroup(group))
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createGroup = async (data: Partial<Group>) => {
    saving.value = true
    try {
      const response = await groupsService.createGroup(data)
      await loadGroups()
      return response.data
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateGroup = async (id: number, data: Partial<Group>) => {
    saving.value = true
    try {
      const response = await groupsService.updateGroup(id, data)
      await loadGroups()
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteGroup = async (id: number) => {
    try {
      await groupsService.deleteGroup(id)
      await loadGroups()
    } catch (error) {
      console.error('Erro ao excluir grupo:', error)
      throw error
    }
  }

  const addUserToGroup = async (userId: number, groupId: number) => {
    loadingMembers.value = true
    try {
      await userGroupsService.createUserGroup({
        user: userId,
        group: groupId,
      })
      if (selectedGroup.value?.id === groupId) {
        const response = await groupsService.getGroupById(groupId)
        selectedGroup.value = response.data
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário ao grupo:', error)
      throw error
    } finally {
      loadingMembers.value = false
    }
  }

  const removeUserFromGroup = async (userId: number, groupId: number) => {
    loadingMembers.value = true
    try {
      await userGroupsService.deleteUserGroup(userId)
      if (selectedGroup.value?.id === groupId) {
        const response = await groupsService.getGroupById(groupId)
        selectedGroup.value = response.data
      }
    } catch (error) {
      console.error('Erro ao remover usuário do grupo:', error)
      throw error
    } finally {
      loadingMembers.value = false
    }
  }

  // Helpers
  const isUserInGroup = (user: User, group: Group) => {
    return group.users?.some(u => u.id === user.id) || false
  }

  return {
    // Estado
    groups,
    selectedGroup,
    loading,
    saving,
    loadingMembers,

    // Métodos
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addUserToGroup,
    removeUserFromGroup,

    // Helpers
    isUserInGroup,
  }
}
