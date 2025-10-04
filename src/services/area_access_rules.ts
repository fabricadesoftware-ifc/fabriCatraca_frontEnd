import type { AreaAccessRule, BaseResponse, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

interface AreaAccessRuleCreate {
  area_id: number
  access_rule_id: number
}

class AreaAccessRulesService {
  async getAreaAccessRules (params?: QueryParams): Promise<PaginatedResponse<AreaAccessRule>> {
    try {
      const response = await api.get('/area_access_rules/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getAreaAccessRuleById (id: number): Promise<BaseResponse<AreaAccessRule>> {
    try {
      const response = await api.get(`/area_access_rules/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createAreaAccessRule (data: Partial<AreaAccessRuleCreate>): Promise<BaseResponse<AreaAccessRule>> {
    try {
      const response = await api.post('/area_access_rules/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateAreaAccessRule (id: number, data: Partial<AreaAccessRule>): Promise<BaseResponse<AreaAccessRule>> {
    try {
      const response = await api.patch(`/area_access_rules/${id}/`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteAreaAccessRule (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/area_access_rules/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new AreaAccessRulesService()
