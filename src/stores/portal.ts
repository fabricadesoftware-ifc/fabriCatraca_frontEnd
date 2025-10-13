import type { Portal } from '@/types'
import { defineStore } from 'pinia'
import { useUIState } from '@/composables/useUIState'
import portalsService from '@/services/portals'

export const usePortalStore = defineStore('portal', {
  state: () => ({
    portals: [] as Portal[],
    selectedPortal: null as Portal | null,
    loading: false,
    saving: false,
  }),

  actions: {
    async loadPortals () {
      const { adaptPortal } = useUIState()
      this.loading = true
      try {
        const response = await portalsService.getPortals()
        this.portals = response.results.map(portal => adaptPortal(portal))
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPortal (data: Partial<Portal>) {
      this.saving = true
      try {
        const response = await portalsService.createPortal(data)
        this.portals.push(response.data)
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePortal (id: number, data: Partial<Portal>) {
      this.saving = true
      try {
        const response = await portalsService.updatePortal(id, data)
        const index = this.portals.findIndex(p => p.id === id)
        if (index !== -1) {
          this.portals[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deletePortal (id: number) {
      this.saving = true
      try {
        await portalsService.deletePortal(id)
        this.portals = this.portals.filter(p => p.id !== id)
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.saving = false
      }
    },

    getPortalTypeColor (type: string) {
      const colors: Record<string, string> = {
        entrance: 'success',
        exit: 'error',
        both: 'primary',
      }
      return colors[type] || 'grey'
    },

    getPortalTypeIcon (type: string) {
      const icons: Record<string, string> = {
        entrance: 'mdi-login',
        exit: 'mdi-logout',
        both: 'mdi-swap-horizontal',
      }
      return icons[type] || 'mdi-door'
    },

    getPortalTypeLabel (type: string) {
      const labels: Record<string, string> = {
        entrance: 'Entrada',
        exit: 'Saída',
        both: 'Entrada/Saída',
      }
      return labels[type] || 'Desconhecido'
    },
  },
})
