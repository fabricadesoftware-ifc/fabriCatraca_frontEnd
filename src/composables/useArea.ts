import type { Area } from '@/types'
import { ref } from 'vue'
import { AreasService } from '@/services'

export function useArea () {
  // Estado
  const areas = ref<Area[]>([])
  const selectedArea = ref<Area | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  // Métodos
  const loadAreas = async () => {
    loading.value = true
    try {
      const response = await AreasService.getAreas()
      areas.value = response.results
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createArea = async (data: Partial<Area>) => {
    saving.value = true
    try {
      const response = await AreasService.createArea(data)
      await loadAreas()
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateArea = async (id: number, data: Partial<Area>) => {
    saving.value = true
    try {
      const response = await AreasService.updateArea(id, data)
      await loadAreas()
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteArea = async (id: number) => {
    try {
      await AreasService.deleteArea(id)
      await loadAreas()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Helpers
  const getAreaColor = (areaId: number) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info']
    return colors[areaId % colors.length]
  }

  return {
    // Estado
    areas,
    selectedArea,
    loading,
    saving,

    // Métodos
    loadAreas,
    createArea,
    updateArea,
    deleteArea,

    // Helpers
    getAreaColor,
  }
}
