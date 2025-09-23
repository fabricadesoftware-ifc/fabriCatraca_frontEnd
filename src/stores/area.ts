import type { Area } from '@/types'
import { defineStore } from 'pinia'
import { AreasService } from '@/services'
import router from '@/router'

export const useAreaStore = defineStore('area', {
  state: () => ({
    areas: [] as Area[],
    area: [] as Area[],
    selectedArea: null as Area | null,
    loading: false,
    saving: false,
  }),

  actions: {
    async loadAreas() {
      this.loading = true
      try {
        const response = await AreasService.getAreas()
        this.areas = response.results
        console.log('areas pegas')
      } catch (error) {
        console.error('Erro ao carregar áreas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createArea(data: Partial<Area>) {
      this.saving = true
      try {
        const response = await AreasService.createArea(data)
        this.areas.push(response.data)
        return response.data
      } catch (error) {
        console.error('Erro ao criar área:', error)
        throw error
      } finally {
        this.saving = false
        router.go()
      }
    },

    async updateArea(id: number, data: Partial<Area>) {
      this.saving = true
      try {
        const response = await AreasService.updateArea(id, data)
        const index = this.areas.findIndex(a => a.id === id)
        if (index !== -1) {
          this.areas[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar área:', error)
        throw error
      } finally {
        this.saving = false
        router.go()
      }
    },

    async getAreaById(id: number) {
      this.loading = true
      try {
        const response = await AreasService.getAreaById(id)
        this.area = response
      }
      catch (error) {
        console.log('Erro ao atualizar área:', error)
      }
      finally {
        this.loading = false
      }
    },

    async deleteArea(id: number) {
      this.saving = true
      try {
        await AreasService.deleteArea(id)
        this.areas = this.areas.filter(a => a.id !== id)
      } catch (error) {
        console.error('Erro ao excluir área:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    getAreaColor(areaId: number) {
      const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info']
      return colors[areaId % colors.length]
    },
  },
})

