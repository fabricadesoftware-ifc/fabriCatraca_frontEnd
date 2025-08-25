import type { BaseResponse, Bio, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class BioService {
  async getBio (params?: QueryParams): Promise<PaginatedResponse<Bio>> {
    try {
      const response = await api.get('/templates/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getBioById (id: number): Promise<BaseResponse<Bio>> {
    try {
      const response = await api.get(`/templates/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createBio (data: Partial<Bio>): Promise<BaseResponse<Bio>> {
    try {
      const response = await api.post('/templates/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteBio (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/templates/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new BioService()
