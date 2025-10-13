import type {
  CatraConfig,
  Device,
  HardwareConfig,
  MonitorConfig,
  PushServerConfig,
  SecurityConfig,
  SystemConfig,
  UIConfig,
} from '@/types'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useControlIdConfigStore } from '@/stores'

export function useDeviceConfig (device: Device | null) {
  const configStore = useControlIdConfigStore()
  const saving = ref(false)
  const activating = ref(false)

  async function loadConfigs () {
    if (!device?.id) {
      return
    }
    await configStore.loadAllConfigs(device.id)
  }

  async function saveSystemConfig (data: Partial<SystemConfig>) {
    if (!device?.id) {
      return
    }
    saving.value = true
    try {
      await configStore.saveSystemConfig(device.id, data)
      toast.success('Configurações de sistema salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações de sistema')
      throw error
    } finally {
      saving.value = false
    }
  }

  async function saveHardwareConfig (data: Partial<HardwareConfig>) {
    if (!device?.id) {
      return
    }
    saving.value = true
    try {
      await configStore.saveHardwareConfig(device.id, data)
      toast.success('Configurações de hardware salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações de hardware')
      throw error
    } finally {
      saving.value = false
    }
  }

  async function saveSecurityConfig (data: Partial<SecurityConfig>) {
    if (!device?.id) {
      return
    }
    saving.value = true
    try {
      await configStore.saveSecurityConfig(device.id, data)
      toast.success('Configurações de segurança salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações de segurança')
      throw error
    } finally {
      saving.value = false
    }
  }

  async function saveUIConfig (data: Partial<UIConfig>) {
    if (!device?.id) {
      return
    }
    saving.value = true
    try {
      await configStore.saveUIConfig(device.id, data)
      toast.success('Configurações de interface salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações de interface')
      throw error
    } finally {
      saving.value = false
    }
  }

  async function saveCatraConfig (data: Partial<CatraConfig>) {
    if (!device?.id) {
      return
    }
    saving.value = true
    try {
      await configStore.saveCatraConfig(device.id, data)
      toast.success('Configurações da catraca salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações da catraca')
      throw error
    } finally {
      saving.value = false
    }
  }

  async function savePushServerConfig (data: Partial<PushServerConfig>) {
    if (!device?.id) {
      return
    }
    saving.value = true
    try {
      await configStore.savePushServerConfig(device.id, data)
      toast.success('Configurações do Push Server salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações do Push Server')
      throw error
    } finally {
      saving.value = false
    }
  }

  async function saveMonitorConfig (data: Partial<MonitorConfig>) {
    if (!device?.id) {
      return
    }
    saving.value = true
    try {
      await configStore.saveMonitorConfig(device.id, data)
      toast.success('Configurações do Monitor salvas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações do Monitor')
      throw error
    } finally {
      saving.value = false
    }
  }

  async function activateMonitor (monitorData: Partial<MonitorConfig>) {
    const hostname = (monitorData.hostname || configStore.monitorConfig?.hostname || '').toString().trim()

    if (!hostname) {
      toast.error('Hostname/IP é obrigatório para ativar o monitor')
      return
    }

    activating.value = true
    try {
      // Salva antes de ativar se necessário
      const current = configStore.monitorConfig
      const needsSave = !current?.id
        || current.hostname !== monitorData.hostname
        || current.port !== monitorData.port
        || current.path !== monitorData.path

      if (needsSave && device?.id) {
        await configStore.saveMonitorConfig(device.id, monitorData)
      }

      await configStore.activateMonitor(monitorData)
      toast.success('Monitor ativado com sucesso!')
    } catch (error: any) {
      console.error(error)
      const msg = error?.response?.data?.error || error?.message || 'Erro ao ativar monitor'
      toast.error(msg)
      throw error
    } finally {
      activating.value = false
    }
  }

  return {
    saving,
    activating,
    loadConfigs,
    saveSystemConfig,
    saveHardwareConfig,
    saveSecurityConfig,
    saveUIConfig,
    saveCatraConfig,
    savePushServerConfig,
    saveMonitorConfig,
    activateMonitor,
  }
}
