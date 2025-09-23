import type { Area, QueryParams } from '@/types'
import { defineStore } from 'pinia'
import router from '@/router'
import { AreasService } from '@/services'

export const useAreaStore = defineStore('area', {
  state: () => ({
    areas: [] as Area[],
    selectedArea: null as Area | null,
    loading: false,
    saving: false,
    current_page: 1,
    page_size: 10,
    count: 0,
    total_pages: 0,
  }),

  actions: {
    async loadAreas(params?: QueryParams) {
      this.loading = true
      try {
        const response = await AreasService.getAreas(params)
        this.current_page = response.current_page || 1
        this.page_size = response.page_size
        this.count = response.count
        this.total_pages = response.total_pages || 1
        this.areas = response.results
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
      try {
        const response = await AreasService.getAreaById(id)
        return response.data || response
      } catch (error) {
        console.error('Erro ao buscar área:', error)
        throw error
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

