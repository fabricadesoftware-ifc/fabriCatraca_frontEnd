import type { TimeSpan, TimeZone } from '@/types'
import { ref } from 'vue'
import timeSpansService from '@/services/time_spans'
import timeZonesService from '@/services/time_zones'
import { useUIState } from './useUIState'

export function useTimeZone () {
  // Estado
  const timeZones = ref<TimeZone[]>([])
  const selectedTimeZone = ref<TimeZone | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const loadingTimeSpans = ref(false)

  // Métodos
  const { adaptTimeZone } = useUIState()

  const loadTimeZones = async () => {
    loading.value = true
    try {
      const response = await timeZonesService.getTimeZones()
      timeZones.value = response.results.map(tz => adaptTimeZone(tz))
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createTimeZone = async (data: Partial<TimeZone>) => {
    saving.value = true
    try {
      const response = await timeZonesService.createTimeZone(data)
      await loadTimeZones()
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateTimeZone = async (id: number, data: Partial<TimeZone>) => {
    saving.value = true
    try {
      const response = await timeZonesService.updateTimeZone(id, data)
      await loadTimeZones()
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteTimeZone = async (id: number) => {
    try {
      await timeZonesService.deleteTimeZone(id)
      await loadTimeZones()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const createTimeSpan = async (data: Partial<TimeSpan>) => {
    loadingTimeSpans.value = true
    try {
      const response = await timeSpansService.createTimeSpan(data)
      if (selectedTimeZone.value) {
        const updatedTimeZone = await timeZonesService.getTimeZoneById(selectedTimeZone.value.id)
        selectedTimeZone.value = updatedTimeZone.data
      }
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loadingTimeSpans.value = false
    }
  }

  const updateTimeSpan = async (id: number, data: Partial<TimeSpan>) => {
    loadingTimeSpans.value = true
    try {
      const response = await timeSpansService.updateTimeSpan(id, data)
      if (selectedTimeZone.value) {
        const updatedTimeZone = await timeZonesService.getTimeZoneById(selectedTimeZone.value.id)
        selectedTimeZone.value = updatedTimeZone.data
      }
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loadingTimeSpans.value = false
    }
  }

  const deleteTimeSpan = async (id: number) => {
    loadingTimeSpans.value = true
    try {
      await timeSpansService.deleteTimeSpan(id)
      if (selectedTimeZone.value) {
        const updatedTimeZone = await timeZonesService.getTimeZoneById(selectedTimeZone.value.id)
        selectedTimeZone.value = updatedTimeZone.data
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loadingTimeSpans.value = false
    }
  }

  // Helpers
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

  const getDayLabel = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return days[day - 1] || 'Desconhecido'
  }

  const getDayColor = (day: number) => {
    const colors = ['error', 'primary', 'primary', 'primary', 'primary', 'primary', 'warning']
    return colors[day - 1] || 'grey'
  }

  return {
    // Estado
    timeZones,
    selectedTimeZone,
    loading,
    saving,
    loadingTimeSpans,

    // Métodos
    loadTimeZones,
    createTimeZone,
    updateTimeZone,
    deleteTimeZone,
    createTimeSpan,
    updateTimeSpan,
    deleteTimeSpan,

    // Helpers
    formatTime,
    getDayLabel,
    getDayColor,
  }
}
