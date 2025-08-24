import type { AccessLogs, BaseResponse, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class AccessLogsService {
  async getAccessLogs (params?: QueryParams): Promise<PaginatedResponse<AccessLogs>> {
    try {
      const response = await api.get('/access_logs', { params })
      return response.data as PaginatedResponse<AccessLogs>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getAccessLogById (id: number): Promise<BaseResponse<AccessLogs>> {
    try {
      const response = await api.get(`/access_logs/${id}`)
      return response.data as BaseResponse<AccessLogs>
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new AccessLogsService()
