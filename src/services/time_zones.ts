import { controlIdApi as api } from '@/plugins/api'
import type { TimeZone, QueryParams, BaseResponse, PaginatedResponse } from '@/types'

class TimeZonesService {
  async getTimeZones (params?: QueryParams): Promise<PaginatedResponse<TimeZone[]>> {
    try {
      const response = await api.get('/time_zones', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getTimeZoneById (id: number): Promise<BaseResponse<TimeZone>> {
    try {
      const response = await api.get(`/time_zones/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createTimeZone (data: Partial<TimeZone>): Promise<BaseResponse<TimeZone>> {
    try {
      const response = await api.post('/time_zones', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateTimeZone (id: number, data: Partial<TimeZone>): Promise<BaseResponse<TimeZone>> {
    try {
      const response = await api.patch(`/time_zones/${id}`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteTimeZone (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/time_zones/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new TimeZonesService()
