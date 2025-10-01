import { controlIdApi as api } from '@/plugins/api'

class UserGroupsImportService {
  async importUsersToGroup (formData: FormData): Promise<any> {
    const response = await api.post('/user_groups/import_users/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
    })
    return response.data
  }
}

export default new UserGroupsImportService()
