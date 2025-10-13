import { defineStore } from 'pinia'
import { ConfigService } from '@/services'

export const useConfigStore = defineStore('config', {
  state: () => ({
    syncing: false,
    lastSyncTime: null as Date | null,
  }),

  actions: {
    async syncData () {
      this.syncing = true
      try {
        await ConfigService.syncData()
        this.lastSyncTime = new Date()
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.syncing = false
      }
    },
  },
})
