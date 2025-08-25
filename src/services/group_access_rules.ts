import type { BaseResponse, GroupAccessRule, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class GroupAccessRulesService {
  async getGroupAccessRules (params?: QueryParams): Promise<PaginatedResponse<GroupAccessRule>> {
    try {
      const response = await api.get('/group_access_rules/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getGroupAccessRuleById (id: number): Promise<BaseResponse<GroupAccessRule>> {
    try {
      const response = await api.get(`/group_access_rules/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createGroupAccessRule (data: Partial<GroupAccessRule>): Promise<BaseResponse<GroupAccessRule>> {
    try {
      const response = await api.post('/group_access_rules/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateGroupAccessRule (id: number, data: Partial<GroupAccessRule>): Promise<BaseResponse<GroupAccessRule>> {
    try {
      const response = await api.patch(`/group_access_rules/${id}/`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteGroupAccessRule (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/group_access_rules/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new GroupAccessRulesService()
