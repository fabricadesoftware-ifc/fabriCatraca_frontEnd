import { controlIdApi as api } from '@/plugins/api'

class ImportUsersService {
  async importUsers (formData: FormData): Promise<any> {
    try {
      const response = await api.post('/import_users/', formData, {
        timeout: 120_000, // 120 seconds timeout
        headers: {
          // Explicitamente não definir Content-Type para FormData
          'Content-Type': undefined,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error importing users:', error)
      throw error
    }
  }
}

export default new ImportUsersService()
