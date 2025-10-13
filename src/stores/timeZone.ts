import type { TimeSpan, TimeZone } from '@/types'
import { defineStore } from 'pinia'
import { useUIState } from '@/composables/useUIState'
import timeSpansService from '@/services/time_spans'
import timeZonesService from '@/services/time_zones'

export const useTimeZoneStore = defineStore('timeZone', {
  state: () => ({
    timeZones: [] as TimeZone[],
    selectedTimeZone: null as TimeZone | null,
    loading: false,
    saving: false,
    loadingTimeSpans: false,
  }),

  actions: {
    async loadTimeZones () {
      const { adaptTimeZone } = useUIState()
      this.loading = true
      try {
        const response = await timeZonesService.getTimeZones()
        this.timeZones = response.results.map(tz => adaptTimeZone(tz))
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTimeZone (data: Partial<TimeZone>) {
      this.saving = true
      try {
        const response = await timeZonesService.createTimeZone(data)
        this.timeZones.push(response.data)
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateTimeZone (id: number, data: Partial<TimeZone>) {
      this.saving = true
      try {
        const response = await timeZonesService.updateTimeZone(id, data)
        const index = this.timeZones.findIndex(tz => tz.id === id)
        if (index !== -1) {
          this.timeZones[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteTimeZone (id: number) {
      this.saving = true
      try {
        await timeZonesService.deleteTimeZone(id)
        this.timeZones = this.timeZones.filter(tz => tz.id !== id)
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async createTimeSpan (data: Partial<TimeSpan>) {
      this.loadingTimeSpans = true
      try {
        const response = await timeSpansService.createTimeSpan(data)
        if (this.selectedTimeZone) {
          const updatedTimeZone = await timeZonesService.getTimeZoneById(this.selectedTimeZone.id)
          this.selectedTimeZone = updatedTimeZone.data
        }
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loadingTimeSpans = false
      }
    },

    async updateTimeSpan (id: number, data: Partial<TimeSpan>) {
      this.loadingTimeSpans = true
      try {
        const response = await timeSpansService.updateTimeSpan(id, data)
        if (this.selectedTimeZone) {
          const updatedTimeZone = await timeZonesService.getTimeZoneById(this.selectedTimeZone.id)
          this.selectedTimeZone = updatedTimeZone.data
        }
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loadingTimeSpans = false
      }
    },

    async deleteTimeSpan (id: number) {
      this.loadingTimeSpans = true
      try {
        await timeSpansService.deleteTimeSpan(id)
        if (this.selectedTimeZone) {
          const updatedTimeZone = await timeZonesService.getTimeZoneById(this.selectedTimeZone.id)
          this.selectedTimeZone = updatedTimeZone.data
        }
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loadingTimeSpans = false
      }
    },

    formatTime (time: string) {
      const [hours, minutes] = time.split(':')
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
    },

    getDayLabel (day: number) {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      return days[day - 1] || 'Desconhecido'
    },

    getDayColor (day: number) {
      const colors = ['error', 'primary', 'primary', 'primary', 'primary', 'primary', 'warning']
      return colors[day - 1] || 'grey'
    },
  },
})
