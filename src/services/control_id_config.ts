import type {
  CatraConfig,
  HardwareConfig,
  MonitorConfig,
  PaginatedResponse,
  PushServerConfig,
  QueryParams,
  SecurityConfig,
  SystemConfig,
  UIConfig,
} from '@/types'
import { controlIdConfigApi as api } from '@/plugins/api'

class ControlIdConfigService {
  // System Config
  async getSystemConfigs (params?: QueryParams): Promise<PaginatedResponse<SystemConfig>> {
    try {
      const response = await api.get('/system-configs/', { params })
      return response.data as PaginatedResponse<SystemConfig>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getSystemConfigByDevice (deviceId: number): Promise<SystemConfig> {
    try {
      const response = await api.get('/system-configs/', {
        params: { device: deviceId },
      })
      const data = response.data as PaginatedResponse<SystemConfig>
      return data.results[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createSystemConfig (data: Partial<SystemConfig>): Promise<SystemConfig> {
    try {
      const response = await api.post('/system-configs/', data)
      return response.data as SystemConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateSystemConfig (id: number, data: Partial<SystemConfig>): Promise<SystemConfig> {
    try {
      const response = await api.patch(`/system-configs/${id}/`, data)
      return response.data as SystemConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async syncSystemConfigFromCatraca (id: number): Promise<SystemConfig> {
    try {
      const response = await api.post(`/system-configs/${id}/sync-from-catraca/`)
      return response.data as SystemConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Hardware Config
  async getHardwareConfigs (params?: QueryParams): Promise<PaginatedResponse<HardwareConfig>> {
    try {
      const response = await api.get('/hardware-configs/', { params })
      return response.data as PaginatedResponse<HardwareConfig>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getHardwareConfigByDevice (deviceId: number): Promise<HardwareConfig> {
    try {
      const response = await api.get('/hardware-configs/', {
        params: { device: deviceId },
      })
      const data = response.data as PaginatedResponse<HardwareConfig>
      return data.results[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createHardwareConfig (data: Partial<HardwareConfig>): Promise<HardwareConfig> {
    try {
      const response = await api.post('/hardware-configs/', data)
      return response.data as HardwareConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateHardwareConfig (id: number, data: Partial<HardwareConfig>): Promise<HardwareConfig> {
    try {
      const response = await api.patch(`/hardware-configs/${id}/`, data)
      return response.data as HardwareConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Security Config
  async getSecurityConfigs (params?: QueryParams): Promise<PaginatedResponse<SecurityConfig>> {
    try {
      const response = await api.get('/security-configs/', { params })
      return response.data as PaginatedResponse<SecurityConfig>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getSecurityConfigByDevice (deviceId: number): Promise<SecurityConfig> {
    try {
      const response = await api.get('/security-configs/', {
        params: { device: deviceId },
      })
      const data = response.data as PaginatedResponse<SecurityConfig>
      return data.results[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createSecurityConfig (data: Partial<SecurityConfig>): Promise<SecurityConfig> {
    try {
      const response = await api.post('/security-configs/', data)
      return response.data as SecurityConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateSecurityConfig (id: number, data: Partial<SecurityConfig>): Promise<SecurityConfig> {
    try {
      const response = await api.patch(`/security-configs/${id}/`, data)
      return response.data as SecurityConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // UI Config
  async getUIConfigs (params?: QueryParams): Promise<PaginatedResponse<UIConfig>> {
    try {
      const response = await api.get('/ui-configs/', { params })
      return response.data as PaginatedResponse<UIConfig>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getUIConfigByDevice (deviceId: number): Promise<UIConfig> {
    try {
      const response = await api.get('/ui-configs/', {
        params: { device: deviceId },
      })
      const data = response.data as PaginatedResponse<UIConfig>
      return data.results[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createUIConfig (data: Partial<UIConfig>): Promise<UIConfig> {
    try {
      const response = await api.post('/ui-configs/', data)
      return response.data as UIConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateUIConfig (id: number, data: Partial<UIConfig>): Promise<UIConfig> {
    try {
      const response = await api.patch(`/ui-configs/${id}/`, data)
      return response.data as UIConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Catra Config
  async getCatraConfigs (params?: QueryParams): Promise<PaginatedResponse<CatraConfig>> {
    try {
      const response = await api.get('/catra-configs/', { params })
      return response.data as PaginatedResponse<CatraConfig>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getCatraConfigByDevice (deviceId: number): Promise<CatraConfig> {
    try {
      const response = await api.get('/catra-configs/', {
        params: { device: deviceId },
      })
      const data = response.data as PaginatedResponse<CatraConfig>
      return data.results[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createCatraConfig (data: Partial<CatraConfig>): Promise<CatraConfig> {
    try {
      const response = await api.post('/catra-configs/', data)
      return response.data as CatraConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateCatraConfig (id: number, data: Partial<CatraConfig>): Promise<CatraConfig> {
    try {
      const response = await api.patch(`/catra-configs/${id}/`, data)
      return response.data as CatraConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Push Server Config
  async getPushServerConfigs (params?: QueryParams): Promise<PaginatedResponse<PushServerConfig>> {
    try {
      const response = await api.get('/push-server-configs/', { params })
      return response.data as PaginatedResponse<PushServerConfig>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getPushServerConfigByDevice (deviceId: number): Promise<PushServerConfig> {
    try {
      const response = await api.get('/push-server-configs/', {
        params: { device: deviceId },
      })
      const data = response.data as PaginatedResponse<PushServerConfig>
      return data.results[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createPushServerConfig (data: Partial<PushServerConfig>): Promise<PushServerConfig> {
    try {
      const response = await api.post('/push-server-configs/', data)
      return response.data as PushServerConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updatePushServerConfig (id: number, data: Partial<PushServerConfig>): Promise<PushServerConfig> {
    try {
      const response = await api.patch(`/push-server-configs/${id}/`, data)
      return response.data as PushServerConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Sync All
  async syncAll (): Promise<any> {
    try {
      const response = await api.post('/sync/')
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getSyncStatus (): Promise<any> {
    try {
      const response = await api.get('/sync/status/')
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new ControlIdConfigService()
