import type { AccessRule } from '@/types'
import { ref } from 'vue'
import accessRulesService from '@/services/access_rules'
import { useUIState } from './useUIState'

export function useAccessRule () {
  // Estado
  const accessRules = ref<AccessRule[]>([])
  const selectedRule = ref<AccessRule | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  // Métodos
  const { adaptAccessRule } = useUIState()

  const loadAccessRules = async () => {
    loading.value = true
    try {
      const response = await accessRulesService.getAccessRules()
      accessRules.value = response.results.map(rule => adaptAccessRule(rule))
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createAccessRule = async (data: Partial<AccessRule>) => {
    saving.value = true
    try {
      const response = await accessRulesService.createAccessRule(data)
      await loadAccessRules()
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateAccessRule = async (id: number, data: Partial<AccessRule>) => {
    saving.value = true
    try {
      const response = await accessRulesService.updateAccessRule(id, data)
      await loadAccessRules()
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteAccessRule = async (id: number) => {
    try {
      await accessRulesService.deleteAccessRule(id)
      await loadAccessRules()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Helpers
  const getRuleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      allow: 'success',
      deny: 'error',
      conditional: 'warning',
    }
    return colors[type] || 'grey'
  }

  const getRuleTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      allow: 'mdi-check-circle',
      deny: 'mdi-close-circle',
      conditional: 'mdi-help-circle',
    }
    return icons[type] || 'mdi-shield'
  }

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      allow: 'Permitir',
      deny: 'Negar',
      conditional: 'Condicional',
    }
    return labels[type] || 'Desconhecido'
  }

  const getPriorityColor = (priority: number) => {
    const colors: Record<number, string> = {
      1: 'grey',
      2: 'blue',
      3: 'orange',
      4: 'red',
      5: 'purple',
    }
    return colors[priority] || 'grey'
  }

  return {
    // Estado
    accessRules,
    selectedRule,
    loading,
    saving,

    // Métodos
    loadAccessRules,
    createAccessRule,
    updateAccessRule,
    deleteAccessRule,

    // Helpers
    getRuleTypeColor,
    getRuleTypeIcon,
    getRuleTypeLabel,
    getPriorityColor,
  }
}
