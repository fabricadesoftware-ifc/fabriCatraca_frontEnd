import type {
  CatraConfig,
  HardwareConfig,
  MonitorConfig,
  PushServerConfig,
  SecurityConfig,
  SystemConfig,
  UIConfig,
} from '@/types'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ControlIdConfigService, ControlIdMonitorService } from '@/services'

export const useControlIdConfigStore = defineStore('controlIdConfig', () => {
  const loading = ref(false)
  const saving = ref(false)
  const syncing = ref(false)

  // System Config
  const systemConfig = ref<SystemConfig | null>(null)
  const hardwareConfig = ref<HardwareConfig | null>(null)
  const securityConfig = ref<SecurityConfig | null>(null)
  const uiConfig = ref<UIConfig | null>(null)
  const catraConfig = ref<CatraConfig | null>(null)
  const pushServerConfig = ref<PushServerConfig | null>(null)
  const monitorConfig = ref<MonitorConfig | null>(null)

  // Carregar todas as configurações de um dispositivo
  const loadAllConfigs = async (deviceId: number) => {
    loading.value = true
    try {
      const [system, hardware, security, ui, catra, pushServer, monitor]
        = await Promise.allSettled([
          ControlIdConfigService.getSystemConfigByDevice(deviceId),
          ControlIdConfigService.getHardwareConfigByDevice(deviceId),
          ControlIdConfigService.getSecurityConfigByDevice(deviceId),
          ControlIdConfigService.getUIConfigByDevice(deviceId),
          ControlIdConfigService.getCatraConfigByDevice(deviceId),
          ControlIdConfigService.getPushServerConfigByDevice(deviceId),
          ControlIdMonitorService.getMonitorConfigByDevice(deviceId),
        ])

      systemConfig.value = system.status === 'fulfilled' ? system.value : null
      hardwareConfig.value
        = hardware.status === 'fulfilled' ? hardware.value : null
      securityConfig.value
        = security.status === 'fulfilled' ? security.value : null
      uiConfig.value = ui.status === 'fulfilled' ? ui.value : null
      catraConfig.value = catra.status === 'fulfilled' ? catra.value : null
      pushServerConfig.value
        = pushServer.status === 'fulfilled' ? pushServer.value : null
      monitorConfig.value
        = monitor.status === 'fulfilled' ? monitor.value : null
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // System Config
  const saveSystemConfig = async (
    deviceId: number,
    data: Partial<SystemConfig>,
  ) => {
    saving.value = true
    try {
      systemConfig.value = systemConfig.value?.id
        ? await ControlIdConfigService.updateSystemConfig(
            systemConfig.value.id,
            data,
          )
        : await ControlIdConfigService.createSystemConfig({
            ...data,
            device: deviceId,
          })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // Hardware Config
  const saveHardwareConfig = async (
    deviceId: number,
    data: Partial<HardwareConfig>,
  ) => {
    saving.value = true
    try {
      hardwareConfig.value = hardwareConfig.value?.id
        ? await ControlIdConfigService.updateHardwareConfig(
            hardwareConfig.value.id,
            data,
          )
        : await ControlIdConfigService.createHardwareConfig({
            ...data,
            device: deviceId,
          })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // Security Config
  const saveSecurityConfig = async (
    deviceId: number,
    data: Partial<SecurityConfig>,
  ) => {
    saving.value = true
    try {
      securityConfig.value = securityConfig.value?.id
        ? await ControlIdConfigService.updateSecurityConfig(
            securityConfig.value.id,
            data,
          )
        : await ControlIdConfigService.createSecurityConfig({
            ...data,
            device: deviceId,
          })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // UI Config
  const saveUIConfig = async (deviceId: number, data: Partial<UIConfig>) => {
    saving.value = true
    try {
      uiConfig.value = uiConfig.value?.id
        ? await ControlIdConfigService.updateUIConfig(uiConfig.value.id, data)
        : await ControlIdConfigService.createUIConfig({
            ...data,
            device: deviceId,
          })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // Catra Config
  const saveCatraConfig = async (
    deviceId: number,
    data: Partial<CatraConfig>,
  ) => {
    saving.value = true
    try {
      catraConfig.value = catraConfig.value?.id
        ? await ControlIdConfigService.updateCatraConfig(
            catraConfig.value.id,
            data,
          )
        : await ControlIdConfigService.createCatraConfig({
            ...data,
            device: deviceId,
          })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // Push Server Config
  const savePushServerConfig = async (
    deviceId: number,
    data: Partial<PushServerConfig>,
  ) => {
    saving.value = true
    try {
      pushServerConfig.value = pushServerConfig.value?.id
        ? await ControlIdConfigService.updatePushServerConfig(
            pushServerConfig.value.id,
            data,
          )
        : await ControlIdConfigService.createPushServerConfig({
            ...data,
            device: deviceId,
          })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // Monitor Config
  const saveMonitorConfig = async (
    deviceId: number,
    data: Partial<MonitorConfig>,
  ) => {
    saving.value = true
    try {
      monitorConfig.value = monitorConfig.value?.id
        ? await ControlIdMonitorService.updateMonitorConfig(
            monitorConfig.value.id,
            data,
          )
        : await ControlIdMonitorService.createMonitorConfig({
            ...data,
            device: deviceId,
          })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // Ativar/Desativar Monitor
  // Agora aceita um payload opcional com dados do monitor (hostname, port, path, request_timeout)
  const activateMonitor = async (data?: Partial<MonitorConfig>) => {
    if (!monitorConfig.value?.id) {
      throw new Error(
        'Configuração do monitor não encontrada. Salve a configuração antes de ativar.',
      )
    }
    saving.value = true
    try {
      await ControlIdMonitorService.activateMonitor(
        monitorConfig.value.id,
        data,
      )
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const deactivateMonitor = async () => {
    if (!monitorConfig.value?.id) {
      throw new Error('Configuração do monitor não encontrada.')
    }
    saving.value = true
    try {
      await ControlIdMonitorService.deactivateMonitor(monitorConfig.value.id)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // Sincronizar tudo
  const syncAll = async () => {
    syncing.value = true
    try {
      await ControlIdConfigService.syncAll()
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      syncing.value = false
    }
  }

  const syncSystemConfigFromCatraca = async () => {
    if (!systemConfig.value?.id) {
      return
    }
    syncing.value = true
    try {
      systemConfig.value
        = await ControlIdConfigService.syncSystemConfigFromCatraca(
          systemConfig.value.id,
        )
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      syncing.value = false
    }
  }

  return {
    loading,
    saving,
    syncing,
    systemConfig,
    hardwareConfig,
    securityConfig,
    uiConfig,
    catraConfig,
    pushServerConfig,
    monitorConfig,
    loadAllConfigs,
    saveSystemConfig,
    saveHardwareConfig,
    saveSecurityConfig,
    saveUIConfig,
    saveCatraConfig,
    savePushServerConfig,
    saveMonitorConfig,
    activateMonitor,
    deactivateMonitor,
    syncAll,
    syncSystemConfigFromCatraca,
  }
})
