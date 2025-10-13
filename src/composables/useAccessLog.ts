import type { AccessLogs } from '@/types'
import { ref } from 'vue'
import { AccessLogsService } from '@/services'

export function useAccessLog () {
  // Estado
  const logs = ref<AccessLogs[]>([])
  const selectedLog = ref<AccessLogs | null>(null)
  const loading = ref(false)
  const exporting = ref(false)
  const totalLogs = ref(0)

  // Estatísticas
  const stats = ref({
    granted: 0,
    denied: 0,
    pending: 0,
    total: 0,
  })

  // Métodos
  const loadLogs = async (params = {}) => {
    loading.value = true
    try {
      const response = await AccessLogsService.getAccessLogs(params)
      if (response && Array.isArray(response.results)) {
        logs.value = response.results
        totalLogs.value = response.count || 0
        updateStats()
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const exportLogs = async () => {
    exporting.value = true
    try {
      // TODO: Implementar exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      exporting.value = false
    }
  }

  // Helpers
  const updateStats = () => {
    const total = totalLogs.value
    const granted = logs.value.filter(log => log.event_type === 7).length
    const denied = logs.value.filter(log => [1, 2, 6, 9].includes(log.event_type)).length
    const pending = logs.value.filter(log => [4, 8].includes(log.event_type)).length

    stats.value = { total, granted, denied, pending }
  }

  const getEventTypeColor = (eventType: number) => {
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
  }

  const getEventTypeLabel = (eventType: number) => {
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
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR')
  }

  return {
    // Estado
    logs,
    selectedLog,
    loading,
    exporting,
    totalLogs,
    stats,

    // Métodos
    loadLogs,
    exportLogs,
    updateStats,

    // Helpers
    getEventTypeColor,
    getEventTypeLabel,
    formatDateTime,
  }
}
