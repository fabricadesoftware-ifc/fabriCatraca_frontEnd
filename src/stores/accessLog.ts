import type { AccessLogs } from '@/types'
import { defineStore } from 'pinia'
import { AccessLogsService } from '@/services'

export const useAccessLogStore = defineStore('accessLog', {
  state: () => ({
    logs: [] as AccessLogs[],
    selectedLog: null as AccessLogs | null,
    loading: false,
    exporting: false,
    totalLogs: 0,
    stats: {
      granted: 0,
      denied: 0,
      pending: 0,
      total: 0,
    },
  }),

  actions: {
    async loadLogs (params = {}) {
      this.loading = true
      try {
        const response = await AccessLogsService.getAccessLogs(params)
        console.log(response)
        if (response && Array.isArray(response?.results)) {
          this.logs = response?.results || []
          console.log(this.logs)
          this.totalLogs = response?.count || 0
          this.updateStats()
        }
      } catch (error) {
        console.error('Erro ao carregar logs:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async exportLogs () {
      this.exporting = true
      try {
        // TODO: Implementar exportação
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error('Erro ao exportar logs:', error)
        throw error
      } finally {
        this.exporting = false
      }
    },

    updateStats () {
      const total = this.totalLogs
      const granted = this.logs.filter(log => log.event_type === 7).length
      const denied = this.logs.filter(log => [1, 2, 6, 9].includes(log.event_type)).length
      const pending = this.logs.filter(log => [4, 8].includes(log.event_type)).length

      this.stats = { total, granted, denied, pending }
    },

    getEventTypeColor (eventType: number) {
      const colors: Record<number, string> = {
        1: 'error', // Equipamento inválido
        2: 'error', // Parâmetros inválidos
        3: 'warning', // Não identificado
        4: 'warning', // Identificação pendente
        5: 'warning', // Tempo esgotado
        6: 'error', // Acesso negado
        7: 'success', // Acesso concedido
        8: 'warning', // Acesso pendente
        9: 'error', // Não é administrador
        10: 'info', // Acesso não identificado
        11: 'success', // Acesso por botoeira
        12: 'success', // Acesso pela interface web
        13: 'info', // Desistência
        14: 'grey', // Sem resposta
        15: 'success', // Acesso pela interfonia
      }
      return colors[eventType] || 'grey'
    },

    getEventTypeLabel (eventType: number) {
      const labels: Record<number, string> = {
        1: 'Equipamento Inválido',
        2: 'Parâmetros Inválidos',
        3: 'Não Identificado',
        4: 'Identificação Pendente',
        5: 'Tempo Esgotado',
        6: 'Acesso Negado',
        7: 'Acesso Concedido',
        8: 'Acesso Pendente',
        9: 'Não é Administrador',
        10: 'Acesso Não Identificado',
        11: 'Acesso por Botoeira',
        12: 'Acesso pela Interface Web',
        13: 'Desistência',
        14: 'Sem Resposta',
        15: 'Acesso pela Interfonia',
      }
      return labels[eventType] || 'Desconhecido'
    },

    formatDateTime (dateTime: string) {
      return new Date(dateTime).toLocaleString('pt-BR')
    },
  },
})
