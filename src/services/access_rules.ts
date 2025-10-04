import type { AccessRule, BaseResponse, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class AccessRulesService {
  async getAccessRules (params?: QueryParams): Promise<PaginatedResponse<AccessRule>> {
    try {
      const response = await api.get('/access_rules/', { params })
      return response.data as PaginatedResponse<AccessRule>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getAccessRuleById (id: number): Promise<BaseResponse<AccessRule>> {
    try {
      const response = await api.get(`/access_rules/${id}/`)
      return response.data as BaseResponse<AccessRule>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createAccessRule (data: Partial<AccessRule>): Promise<AccessRule> {
    try {
      const response = await api.post('/access_rules/', data)
      return response.data as AccessRule
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateAccessRule (id: number, data: Partial<AccessRule>): Promise<AccessRule> {
    try {
      const response = await api.patch(`/access_rules/${id}/`, data)
      return response.data as AccessRule
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteAccessRule (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/access_rules/${id}/`)
      return response.data as BaseResponse<void>
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new AccessRulesService()
