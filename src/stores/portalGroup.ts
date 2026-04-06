import { defineStore } from 'pinia'
import portalGroupsService from '@/services/portal_groups'
import type { PortalGroup, PortalGroupCreate, PortalGroupUpdate } from '@/types/portal-groups'
import type { BaseResponse } from '@/types'

export const usePortalGroupStore = defineStore('portalGroup', {
  state: () => ({
    portalGroups: [] as PortalGroup[],
    selectedPortalGroup: null as PortalGroup | null,
    loading: false,
    saving: false,
    current_page: 1,
    page_size: 10,
    count: 0,
    total_pages: 0,
  }),
  actions: {
    async loadPortalGroups(params?: { page?: number; page_size?: number; search?: string; is_active?: boolean }) {
      this.loading = true
      try {
        const result = await portalGroupsService.getPortalGroups({
          page: this.current_page,
          page_size: this.page_size,
          ...params,
        })
        this.portalGroups = result.results || []
        this.count = result.count || 0
        this.total_pages = result.total_pages || 0
        if (params?.page) this.current_page = params.page
        if (params?.page_size) this.page_size = params.page_size
      } finally {
        this.loading = false
      }
    },
    async createPortalGroup(data: PortalGroupCreate): Promise<PortalGroup> {
      this.saving = true
      try {
        const result = await portalGroupsService.createPortalGroup(data)
        return result as unknown as PortalGroup
      } finally {
        this.saving = false
      }
    },
    async updatePortalGroup(id: number, data: Partial<PortalGroupUpdate>): Promise<PortalGroup> {
      this.saving = true
      try {
        const result = await portalGroupsService.updatePortalGroup(id, data)
        return result as unknown as PortalGroup
      } finally {
        this.saving = false
      }
    },
    async deletePortalGroup(id: number): Promise<void> {
      await portalGroupsService.deletePortalGroup(id)
    },
    async assignDevices(groupId: number, deviceIds: number[]) {
      await portalGroupsService.assignDevices(groupId, deviceIds)
    },
    async removeDevices(groupId: number, deviceIds: number[]) {
      await portalGroupsService.removeDevices(groupId, deviceIds)
    },
  },
})
