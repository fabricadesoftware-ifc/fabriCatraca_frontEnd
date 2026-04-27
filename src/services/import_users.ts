import { controlIdApi as api } from '@/plugins/api'

export interface ImportUsersResult {
  success?: boolean
  message?: string
  error?: string
  elapsed_s?: number
  rows_processed?: number
  sheets_processed?: number
  errors?: string[] | null
  catraca_errors?: string[] | null
}

class ImportUsersService {
  async importUsers (formData: FormData): Promise<ImportUsersResult> {
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
      console.error(error)
      throw error
    }
  }
}

export default new ImportUsersService()
