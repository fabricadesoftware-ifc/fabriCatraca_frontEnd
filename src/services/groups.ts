import { controlIdApi as api } from '@/plugins/api'
import type { Group, QueryParams, BaseResponse, PaginatedResponse } from '@/types'

class GroupsService {
  async getGroups (params?: QueryParams): Promise<PaginatedResponse<Group[]>> {
    try {
      const response = await api.get('/groups', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getGroupById (id: number): Promise<BaseResponse<Group>> {
    try {
      const response = await api.get(`/groups/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createGroup (data: Partial<Group>): Promise<BaseResponse<Group>> {
    try {
      const response = await api.post('/groups', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateGroup (id: number, data: Partial<Group>): Promise<BaseResponse<Group>> {
    try {
      const response = await api.patch(`/groups/${id}`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteGroup (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/groups/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new GroupsService()
