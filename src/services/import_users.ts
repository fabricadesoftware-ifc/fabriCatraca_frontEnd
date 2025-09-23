import { controlIdApi as api } from '@/plugins/api'

class ImportUsersService {
  async importUsers (formData: FormData): Promise<any> {
    const response = await api.post('/import-users/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000, // 120 seconds timeout
    })
    return response.data
  }
}

export default new ImportUsersService()
