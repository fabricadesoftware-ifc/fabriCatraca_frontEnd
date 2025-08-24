import { controlIdApi as api } from '@/plugins/api'
import type { Device, QueryParams, BaseResponse, PaginatedResponse } from '@/types'

class DeviceService {
  async getDevices (params?: QueryParams): Promise<PaginatedResponse<Device[]>> {
    try {
      const response = await api.get('/devices', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getDeviceById (id: number): Promise<BaseResponse<Device>> {
    try {
      const response = await api.get(`/devices/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createDevice (data: Partial<Device>): Promise<BaseResponse<Device>> {
    try {
      const response = await api.post('/devices', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateDevice (id: number, data: Partial<Device>): Promise<BaseResponse<Device>> {
    try {
      const response = await api.patch(`/devices/${id}`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteDevice (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/devices/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async testConnection (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.post(`/devices/${id}/test_connection`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new DeviceService()
