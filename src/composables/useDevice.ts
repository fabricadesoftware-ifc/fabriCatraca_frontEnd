import { ref } from 'vue'
import type { Device } from '@/types'
import { DeviceService } from '@/services'
import { useUIState } from './useUIState'

export function useDevice() {
  // Estado
  const devices = ref<Device[]>([])
  const selectedDevice = ref<Device | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const syncing = ref(false)

  // Métodos
  const { adaptDevice } = useUIState()

  const loadDevices = async () => {
    loading.value = true
    try {
      const response = await DeviceService.getDevices()
      devices.value = response.results.map(device => adaptDevice(device))
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createDevice = async (data: Partial<Device>) => {
    saving.value = true
    try {
      const response = await DeviceService.createDevice(data)
      await loadDevices()
      return response.data
    } catch (error) {
      console.error('Erro ao criar dispositivo:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateDevice = async (id: number, data: Partial<Device>) => {
    saving.value = true
    try {
      const response = await DeviceService.updateDevice(id, data)
      await loadDevices()
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteDevice = async (id: number) => {
    try {
      await DeviceService.deleteDevice(id)
      await loadDevices()
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error)
      throw error
    }
  }

  const testConnection = async (id: number) => {
    try {
      await DeviceService.testConnection(id)
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      throw error
    }
  }

  const syncDevices = async () => {
    syncing.value = true
    try {
      // TODO: Implementar sincronização com API
      await new Promise(resolve => setTimeout(resolve, 2000))
      await loadDevices()
    } catch (error) {
      console.error('Erro ao sincronizar dispositivos:', error)
      throw error
    } finally {
      syncing.value = false
    }
  }

  // Helpers
  const getDeviceStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: 'success',
      offline: 'error',
      warning: 'warning',
      maintenance: 'info',
    }
    return colors[status] || 'grey'
  }

  const getDeviceStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      online: 'Online',
      offline: 'Offline',
      warning: 'Aviso',
      maintenance: 'Manutenção',
    }
    return labels[status] || 'Desconhecido'
  }

  return {
    // Estado
    devices,
    selectedDevice,
    loading,
    saving,
    syncing,

    // Métodos
    loadDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    testConnection,
    syncDevices,

    // Helpers
    getDeviceStatusColor,
    getDeviceStatusLabel,
  }
}
