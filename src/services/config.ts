import { controlIdApi as api } from '@/plugins/api'
import type { BaseResponse } from '@/types'

class ConfigService {
  async syncData (): Promise<BaseResponse<void>> {
    try {
      const response = await api.post('/control_id/sync')
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new ConfigService()
