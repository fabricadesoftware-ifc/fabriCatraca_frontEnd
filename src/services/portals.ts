import type { BaseResponse, PaginatedResponse, Portal, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class PortalsService {
  async getPortals (params?: QueryParams): Promise<PaginatedResponse<Portal>> {
    try {
      const response = await api.get('/portals/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getPortalById (id: number): Promise<BaseResponse<Portal>> {
    try {
      const response = await api.get(`/portals/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createPortal (data: Partial<Portal>): Promise<BaseResponse<Portal>> {
    try {
      const response = await api.post('/portals/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updatePortal (id: number, data: Partial<Portal>): Promise<BaseResponse<Portal>> {
    try {
      const response = await api.patch(`/portals/${id}/`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deletePortal (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/portals/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new PortalsService()
