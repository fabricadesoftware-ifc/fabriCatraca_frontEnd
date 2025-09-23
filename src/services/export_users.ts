import { controlIdApi as api } from '@/plugins/api'

class ExportUsersService {
  async exportUsers (groupId: number, typeFile: 'csv' | 'txt' | 'xlsx'): Promise<any> {
    try {
      const response = await api.get('/export-users/', {
        params: {
          group_id: groupId,
          type_file: typeFile,
        },
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new ExportUsersService()
