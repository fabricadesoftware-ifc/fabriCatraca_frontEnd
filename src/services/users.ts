import { usersApi as api } from '@/plugins/api'
import type { User, QueryParams, BaseResponse, PaginatedResponse } from '@/types'

class UsersService {
  async getUsers (params?: QueryParams): Promise<PaginatedResponse<User[]>> {
    try {
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getUserById (id: number): Promise<BaseResponse<User>> {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createUser (data: Partial<User>): Promise<BaseResponse<User>> {
    try {
      const response = await api.post('/users', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateUser (id: number, data: Partial<User>): Promise<BaseResponse<User>> {
    try {
      const response = await api.patch(`/users/${id}`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteUser (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getMe (): Promise<BaseResponse<User>> {
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new UsersService()
