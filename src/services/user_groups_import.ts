import { controlIdApi as api } from '@/plugins/api'

class UserGroupsImportService {
  async importUsersToGroup (formData: FormData): Promise<any> {
    const response = await api.post('/user_groups/import_users/', formData, {
      timeout: 120_000,
      headers: {
        // Explicitamente não definir Content-Type para FormData
        'Content-Type': undefined,
      },
    })
    return response.data
  }
}

export default new UserGroupsImportService()
