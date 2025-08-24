import { controlIdApi as api } from '@/plugins/api'
import type { PortalAccessRule, QueryParams, BaseResponse, PaginatedResponse } from '@/types'

class PortalAccessRulesService {
  async getPortalAccessRules (params?: QueryParams): Promise<PaginatedResponse<PortalAccessRule[]>> {
    try {
      const response = await api.get('/portal_access_rules', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getPortalAccessRuleById (id: number): Promise<BaseResponse<PortalAccessRule>> {
    try {
      const response = await api.get(`/portal_access_rules/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createPortalAccessRule (data: Partial<PortalAccessRule>): Promise<BaseResponse<PortalAccessRule>> {
    try {
      const response = await api.post('/portal_access_rules', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updatePortalAccessRule (id: number, data: Partial<PortalAccessRule>): Promise<BaseResponse<PortalAccessRule>> {
    try {
      const response = await api.patch(`/portal_access_rules/${id}`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deletePortalAccessRule (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/portal_access_rules/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new PortalAccessRulesService()
