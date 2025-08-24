import { controlIdApi as api } from '@/plugins/api'
import type { TimeSpan, QueryParams, BaseResponse, PaginatedResponse } from '@/types'

class TimeSpansService {
  async getTimeSpans (params?: QueryParams): Promise<PaginatedResponse<TimeSpan[]>> {
    try {
      const response = await api.get('/time_spans', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getTimeSpanById (id: number): Promise<BaseResponse<TimeSpan>> {
    try {
      const response = await api.get(`/time_spans/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createTimeSpan (data: Partial<TimeSpan>): Promise<BaseResponse<TimeSpan>> {
    try {
      const response = await api.post('/time_spans', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateTimeSpan (id: number, data: Partial<TimeSpan>): Promise<BaseResponse<TimeSpan>> {
    try {
      const response = await api.patch(`/time_spans/${id}`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteTimeSpan (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/time_spans/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new TimeSpansService()
