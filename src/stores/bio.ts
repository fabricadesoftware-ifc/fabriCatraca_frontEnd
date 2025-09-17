import type { Bio, BioCreate, QueryParams } from '@/types'
import { defineStore } from 'pinia'
import bioService from '@/services/bio'

export const useBioStore = defineStore('bio', {
  state: () => ({
    bios: [] as Bio[],
    loading: false,
    saving: false,
  }),

  actions: {
    async loadBios (params?: QueryParams) {
      this.loading = true
      try {
        const response = await bioService.getBio(params)
        this.bios = response.results
      } finally {
        this.loading = false
      }
    },

    async loadUserBios (userId: number) {
      return this.loadBios({ user: userId })
    },

    async createBio (data: Partial<BioCreate>) {
      this.saving = true
      try {
        const response = await bioService.createBio(data)
        this.bios.push(response.data)
        return response.data
      } finally {
        this.saving = false
      }
    },

    async deleteBio (id: number) {
      this.saving = true
      try {
        await bioService.deleteBio(id)
        this.bios = this.bios.filter(b => b.id !== id)
      } finally {
        this.saving = false
      }
    },
  },
})
