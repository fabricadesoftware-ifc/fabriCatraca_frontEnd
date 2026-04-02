import type {
  BaseResponse,
  Bio,
  BioCreate,
  LocalCaptureSession,
  PaginatedResponse,
  QueryParams,
} from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class BioService {
  async getBio (params?: QueryParams): Promise<PaginatedResponse<Bio>> {
    try {
      const response = await api.get('/templates/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getBioById (id: number): Promise<BaseResponse<Bio>> {
    try {
      const response = await api.get(`/templates/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createBio (data: Partial<BioCreate>): Promise<BaseResponse<Bio>> {
    try {
      const response = await api.post('/templates/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteBio (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/templates/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async startLocalCapture (data: {
    user_id: number;
    extractor_device_id?: number | null;
    sensor_identifier?: string;
  }): Promise<{ message: string, capture_session: LocalCaptureSession }> {
    try {
      const response = await api.post('/templates/local-capture/start/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getLocalCaptureStatus (sessionId: number): Promise<{ capture_session: LocalCaptureSession }> {
    try {
      const response = await api.get(`/templates/local-capture/${sessionId}/status/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new BioService()
