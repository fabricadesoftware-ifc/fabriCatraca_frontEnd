import { defineStore } from 'pinia'
import exportUsersService from '@/services/export_users'

export const useExportUserStore = defineStore('exportUser', {
  state: () => ({
    loading: false,
  }),

  actions: {
    async exportUsers(groupId: number, typeFile: 'csv' | 'txt' | 'xlsx') {
      this.loading = true
      try {
        const response = await exportUsersService.exportUsers(groupId, typeFile)

        // Criar um blob com os dados
        const blob = new Blob([response], { type: 'application/octet-stream' })

        // Criar URL para download
        const url = window.URL.createObjectURL(blob)

        // Criar link e simular clique para download
        const link = document.createElement('a')
        link.href = url
        link.download = `usuarios_grupo_${groupId}.${typeFile}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Limpar URL
        window.URL.revokeObjectURL(url)

        return response
      } catch (error) {
        console.error('Erro ao exportar usuários:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
