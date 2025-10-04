import type { Area, AreaCreate, BaseResponse, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class AreasService {
  async getAreas (params?: QueryParams): Promise<PaginatedResponse<Area>> {
    try {
      const response = await api.get('/areas/', { params })
      return response.data as PaginatedResponse<Area>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getAreaById (id: number): Promise<BaseResponse<Area>> {
    try {
      const response = await api.get(`/areas/${id}/`)
      return response.data as BaseResponse<Area>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createArea (data: Partial<AreaCreate>): Promise<BaseResponse<Area>> {
    try {
      const response = await api.post('/areas/', data)
      return response.data as BaseResponse<Area>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateArea (id: number, data: Partial<Area>): Promise<BaseResponse<Area>> {
    try {
      const response = await api.patch(`/areas/${id}/`, data)
      return response.data as BaseResponse<Area>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteArea (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/areas/${id}/`)
      return response.data as BaseResponse<void>
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new AreasService()
