import { ref } from 'vue'
import type { Portal } from '@/types'
import portalsService from '@/services/portals'
import { useUIState } from './useUIState'

export function usePortal() {
  // Estado
  const portals = ref<Portal[]>([])
  const selectedPortal = ref<Portal | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  // Métodos
  const { adaptPortal } = useUIState()

  const loadPortals = async () => {
    loading.value = true
    try {
      const response = await portalsService.getPortals()
      portals.value = response.results.map(portal => adaptPortal(portal))
    } catch (error) {
      console.error('Erro ao carregar portais:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createPortal = async (data: Partial<Portal>) => {
    saving.value = true
    try {
      const response = await portalsService.createPortal(data)
      await loadPortals()
      return response.data
    } catch (error) {
      console.error('Erro ao criar portal:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const updatePortal = async (id: number, data: Partial<Portal>) => {
    saving.value = true
    try {
      const response = await portalsService.updatePortal(id, data)
      await loadPortals()
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar portal:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deletePortal = async (id: number) => {
    try {
      await portalsService.deletePortal(id)
      await loadPortals()
    } catch (error) {
      console.error('Erro ao excluir portal:', error)
      throw error
    }
  }

  // Helpers
  const getPortalTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      entrance: 'success',
      exit: 'error',
      both: 'primary',
    }
    return colors[type] || 'grey'
  }

  const getPortalTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      entrance: 'mdi-login',
      exit: 'mdi-logout',
      both: 'mdi-swap-horizontal',
    }
    return icons[type] || 'mdi-door'
  }

  const getPortalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrance: 'Entrada',
      exit: 'Saída',
      both: 'Entrada/Saída',
    }
    return labels[type] || 'Desconhecido'
  }

  return {
    // Estado
    portals,
    selectedPortal,
    loading,
    saving,

    // Métodos
    loadPortals,
    createPortal,
    updatePortal,
    deletePortal,

    // Helpers
    getPortalTypeColor,
    getPortalTypeIcon,
    getPortalTypeLabel,
  }
}
