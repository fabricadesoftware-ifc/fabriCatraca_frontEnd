import { controlIdApi as api } from '@/plugins/api'
import type {
  PortalGroup,
  PortalGroupCreate,
  PortalGroupUpdate,
  PortalDeviceMapping,
} from '@/types/portal-groups'

interface BaseResponse<T> {
  results?: T[]
  count?: number
  current_page?: number
  total_pages?: number
  detail?: string
}

interface PaginatedResponse<T> extends BaseResponse<T> {
  results: T[]
  count: number
  current_page: number
  total_pages: number
}

export class PortalGroupsService {
  async getPortalGroups(params?: {
    page?: number
    page_size?: number
    search?: string
    is_active?: boolean
  }): Promise<PaginatedResponse<PortalGroup>> {
    const response = await api.get<BaseResponse<PortalGroup>>('portal_groups/', { params })
    return response.data as PaginatedResponse<PortalGroup>
  }

  async getPortalGroupById(id: number): Promise<BaseResponse<PortalGroup>> {
    const response = await api.get<BaseResponse<PortalGroup>>(`portal_groups/${id}/`)
    return response.data
  }

  async createPortalGroup(data: PortalGroupCreate): Promise<BaseResponse<PortalGroup>> {
    const response = await api.post<BaseResponse<PortalGroup>>('portal_groups/', data)
    return response.data
  }

  async updatePortalGroup(
    id: number,
    data: Partial<PortalGroupUpdate>,
  ): Promise<BaseResponse<PortalGroup>> {
    const response = await api.patch<BaseResponse<PortalGroup>>(`portal_groups/${id}/`, data)
    return response.data
  }

  async deletePortalGroup(id: number): Promise<BaseResponse<void>> {
    const response = await api.delete<BaseResponse<void>>(`portal_groups/${id}/`)
    return response.data
  }

  async assignDevices(groupId: number, deviceIds: number[]): Promise<BaseResponse<{ success: boolean }>> {
    const response = await api.post<BaseResponse<{ success: boolean }>>(
      `portal_groups/${groupId}/assign-devices/`,
      { device_ids: deviceIds },
    )
    return response.data
  }

  async removeDevices(groupId: number, deviceIds: number[]): Promise<BaseResponse<{ success: boolean }>> {
    const response = await api.post<BaseResponse<{ success: boolean }>>(
      `portal_groups/${groupId}/remove-devices/`,
      { device_ids: deviceIds },
    )
    return response.data
  }
}

export class PortalDevicesService {
  async getPortalDevices(params?: {
    portal?: number
    device?: number
    portal_group?: number
  }): Promise<BaseResponse<PortalDeviceMapping[]>> {
    const response = await api.get<BaseResponse<PortalDeviceMapping[]>>(
      'portal_devices/',
      { params },
    )
    return response.data
  }

  async createPortalDevice(data: {
    portal: number
    device: number
    portal_group: number
  }): Promise<BaseResponse<PortalDeviceMapping>> {
    const response = await api.post<BaseResponse<PortalDeviceMapping>>(
      'portal_devices/',
      data,
    )
    return response.data
  }

  async deletePortalDevice(id: number): Promise<BaseResponse<void>> {
    const response = await api.delete<BaseResponse<void>>(`portal_devices/${id}/`)
    return response.data
  }
}

export default new PortalGroupsService()
