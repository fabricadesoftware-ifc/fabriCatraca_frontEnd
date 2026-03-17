import type {
  BaseResponse,
  Device,
  DeviceLogoSummary,
  DeviceRegistryReport,
  PaginatedResponse,
  QueryParams,
} from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class DeviceService {
  async getDevices (params?: QueryParams): Promise<PaginatedResponse<Device>> {
    try {
      const response = await api.get('/devices/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getDeviceById (id: number): Promise<BaseResponse<Device>> {
    try {
      const response = await api.get(`/devices/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createDevice (data: Partial<Device>): Promise<BaseResponse<Device>> {
    try {
      const response = await api.post('/devices/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateDevice (id: number, data: Partial<Device>): Promise<BaseResponse<Device>> {
    try {
      const response = await api.patch(`/devices/${id}/`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteDevice (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/devices/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async testConnection (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.get(`/devices/${id}/test_connection/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getRegistry (id: number): Promise<DeviceRegistryReport> {
    try {
      const response = await api.get(`/devices/${id}/registry/`)
      return response.data as DeviceRegistryReport
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async syncRegistry (id: number): Promise<any> {
    try {
      const response = await api.post(`/devices/${id}/sync-registry/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getLogoSummary (id: number): Promise<DeviceLogoSummary> {
    try {
      const response = await api.get(`/devices/${id}/logos/`)
      return response.data as DeviceLogoSummary
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getLogoImage (id: number, slotId: number): Promise<Blob> {
    try {
      const response = await api.get(`/devices/${id}/logos/${slotId}/image/`, {
        responseType: 'blob',
      })
      return response.data as Blob
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async uploadLogo (id: number, slotId: number, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await api.post(`/devices/${id}/logos/${slotId}/upload/`, formData)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteLogo (id: number, slotId: number): Promise<any> {
    try {
      const response = await api.post(`/devices/${id}/logos/${slotId}/delete/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async showLogo (id: number, slotId: number): Promise<any> {
    try {
      const response = await api.post(`/devices/${id}/logos/show/`, {
        slot_id: slotId,
      })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new DeviceService()
