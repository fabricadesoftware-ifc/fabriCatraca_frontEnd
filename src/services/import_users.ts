import { controlIdApi as api } from '@/plugins/api'

class ImportUsersService {
  async importUsers (file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/import-users/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000, // 60 seconds timeout
    })
    return response.data
  }
}

export default new ImportUsersService()
