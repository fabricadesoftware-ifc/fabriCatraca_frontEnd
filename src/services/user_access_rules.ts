import type { BaseResponse, PaginatedResponse, QueryParams, UserAccessRule } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class UserAccessRulesService {
  async getUserAccessRules (params?: QueryParams): Promise<PaginatedResponse<UserAccessRule>> {
    try {
      const response = await api.get('/user_access_rules/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getUserAccessRuleById (id: number): Promise<BaseResponse<UserAccessRule>> {
    try {
      const response = await api.get(`/user_access_rules/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createUserAccessRule (data: Partial<UserAccessRule>): Promise<BaseResponse<UserAccessRule>> {
    try {
      const response = await api.post('/user_access_rules/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateUserAccessRule (id: number, data: Partial<UserAccessRule>): Promise<BaseResponse<UserAccessRule>> {
    try {
      const response = await api.patch(`/user_access_rules/${id}/`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteUserAccessRule (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/user_access_rules/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new UserAccessRulesService()
