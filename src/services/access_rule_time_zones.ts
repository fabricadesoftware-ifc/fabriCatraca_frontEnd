import type { AccessRuleTimeZone, AccessRuleTimeZoneCreate, BaseResponse, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class AccessRuleTimeZonesService {
  async getAccessRuleTimeZones (params?: QueryParams): Promise<PaginatedResponse<AccessRuleTimeZone>> {
    try {
      const response = await api.get('/access_rule_time_zones/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getAccessRuleTimeZoneById (id: number): Promise<BaseResponse<AccessRuleTimeZone>> {
    try {
      const response = await api.get(`/access_rule_time_zones/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createAccessRuleTimeZone (data: Partial<AccessRuleTimeZoneCreate>): Promise<BaseResponse<AccessRuleTimeZone>> {
    try {
      const response = await api.post('/access_rule_time_zones/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateAccessRuleTimeZone (id: number, data: Partial<AccessRuleTimeZone>): Promise<BaseResponse<AccessRuleTimeZone>> {
    try {
      const response = await api.patch(`/access_rule_time_zones/${id}/`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteAccessRuleTimeZone (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/access_rule_time_zones/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new AccessRuleTimeZonesService()
