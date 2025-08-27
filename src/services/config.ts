import type { BaseResponse } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class ConfigService {
  async syncData (): Promise<BaseResponse<void>> {
    try {
      const response = await api.get('/sync/')
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new ConfigService()
