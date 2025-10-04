import type {
  MonitorConfig,
  PaginatedResponse,
  QueryParams,
} from '@/types'
import { controlIdMonitorApi as api } from '@/plugins/api'

class ControlIdMonitorService {
  async getMonitorConfigs (params?: QueryParams): Promise<PaginatedResponse<MonitorConfig>> {
    try {
      const response = await api.get('/monitor-configs/', { params })
      return response.data as PaginatedResponse<MonitorConfig>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getMonitorConfigByDevice (deviceId: number): Promise<MonitorConfig> {
    try {
      const response = await api.get('/monitor-configs/', {
        params: { device: deviceId },
      })
      const data = response.data as PaginatedResponse<MonitorConfig>
      return data.results[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createMonitorConfig (data: Partial<MonitorConfig>): Promise<MonitorConfig> {
    try {
      const response = await api.post('/monitor-configs/', data)
      return response.data as MonitorConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateMonitorConfig (id: number, data: Partial<MonitorConfig>): Promise<MonitorConfig> {
    try {
      const response = await api.patch(`/monitor-configs/${id}/`, data)
      return response.data as MonitorConfig
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Agora aceita um payload opcional com dados do monitor (hostname, port, path, request_timeout)
  async activateMonitor (id: number, data?: Partial<MonitorConfig>): Promise<any> {
    try {
      const response = await api.post(`/monitor-configs/${id}/activate/`, data ?? {})
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deactivateMonitor (id: number): Promise<any> {
    try {
      const response = await api.post(`/monitor-configs/${id}/deactivate/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async probeMonitor (id: number): Promise<any> {
    try {
      const response = await api.get(`/monitor-configs/${id}/probe/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new ControlIdMonitorService()
