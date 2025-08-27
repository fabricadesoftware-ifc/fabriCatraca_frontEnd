import type { Device } from '@/types'
import { defineStore } from 'pinia'
import { useUIState } from '@/composables/useUIState'
import { ConfigService, DeviceService } from '@/services'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [] as Device[],
    selectedDevice: null as Device | null,
    loading: false,
    saving: false,
    syncing: false,
  }),

  actions: {
    async loadDevices () {
      const { adaptDevice } = useUIState()
      this.loading = true
      try {
        const response = await DeviceService.getDevices()
        this.devices = response.results.map(device => adaptDevice(device))
      } catch (error) {
        console.error('Erro ao carregar dispositivos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createDevice (data: Partial<Device>) {
      this.saving = true
      try {
        const response = await DeviceService.createDevice(data)
        this.devices.push(response.data)
        return response.data
      } catch (error) {
        console.error('Erro ao criar dispositivo:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateDevice (id: number, data: Partial<Device>) {
      this.saving = true
      try {
        const response = await DeviceService.updateDevice(id, data)
        const index = this.devices.findIndex(d => d.id === id)
        if (index !== -1) {
          this.devices[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar dispositivo:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteDevice (id: number) {
      this.saving = true
      try {
        await DeviceService.deleteDevice(id)
        this.devices = this.devices.filter(d => d.id !== id)
      } catch (error) {
        console.error('Erro ao excluir dispositivo:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async testConnection (id: number) {
      try {
        await DeviceService.testConnection(id)
      } catch (error) {
        console.error('Erro ao testar conexão:', error)
        throw error
      }
    },

    async syncDevices () {
      this.syncing = true
      try {
        await ConfigService.syncData()
        await this.loadDevices()
      } catch (error) {
        console.error('Erro ao sincronizar dispositivos:', error)
        throw error
      } finally {
        this.syncing = false
      }
    },

    getDeviceStatusColor (status: string) {
      switch (status) {
        case 'online': {
          return 'success'
        }
        case 'offline': {
          return 'error'
        }
        case 'syncing': {
          return 'warning'
        }
        default: {
          return 'grey'
        }
      }
    },

    getDeviceStatusLabel (status: string) {
      switch (status) {
        case 'online': {
          return 'Online'
        }
        case 'offline': {
          return 'Offline'
        }
        case 'syncing': {
          return 'Sincronizando'
        }
        default: {
          return 'Desconhecido'
        }
      }
    },
  },
})
