export interface Device {
  id: number
  name: string
  ip: string
  is_active: boolean
}

export interface Portal {
  id: number
  name: string
}

export interface PortalGroup {
  id: number
  name: string
  description: string
  is_active: boolean
  devices: Device[]
}

export interface PortalGroupCreate {
  name: string
  description?: string
  device_ids?: number[]
}

export interface PortalGroupUpdate {
  name?: string
  description?: string
  is_active?: boolean
  device_ids?: number[]
}

export interface PortalDeviceMapping {
  id: number
  portal: number
  device: number
  portal_group: number
  portal_name: string
  device_name: string
  portal_group_name: string
}
