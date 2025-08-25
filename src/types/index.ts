export interface BaseResponse<T> {
  data: T
  message?: string
  status?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
  page_size: number
  page?: number
}

export interface QueryParams {
  [key: string]: unknown | undefined
  page?: number
  limit?: number
  search?: string
}

export interface AccessRule {
  id: number
  name: string
  description?: string
  type: string
  priority: number
  is_active: boolean
  time_zones?: TimeZone[] | number[]
  areas?: Area[] | number[]
  updating?: boolean
}

export interface AccessRuleTimeZone {
  id: number
  access_rule: AccessRule
  time_zone: TimeZone
}

export interface Area {
  id: number
  name: string
}

export interface Bio {
  id: number
  user: number
  template: string
  finger_type: number
  finger_position: number
  devices: Device[]
}

export interface Card {
  id: number
  number: string
  value: number
  user: User
  devices: Device[]
}

export interface Device {
  id: number
  name: string
  ip: string
  username: string
  is_active: boolean
  is_default: boolean
  status?: string
  updating?: boolean
}

export interface Group {
  id: number
  name: string
  description?: string
  is_active?: boolean
  member_count?: number
  users?: User[]
  updating?: boolean
}

export interface GroupAccessRule {
  id: number
  group: Group
  access_rule: AccessRule
}

export interface Portal {
  id: number
  name: string
  description?: string
  area_from: Area
  area_to: Area
  is_active: boolean
  updating?: boolean
  type?: string
  area?: Area
  devices?: Device[]
}

export interface PortalAccessRule {
  id: number
  portal: Portal
  access_rule: AccessRule
}

export interface TimeSpan {
  id: number
  time_zone: TimeZone | number
  start: number
  end: number
  sun: boolean
  mon: boolean
  tue: boolean
  wed: boolean
  thu: boolean
  fri: boolean
  sat: boolean
  hol1: boolean
  hol2: boolean
  hol3: boolean
}

export interface TimeZone {
  id: number
  name: string
  description?: string
  is_active: boolean
  time_spans?: TimeSpan[]
  updating?: boolean
}

export interface User {
  id: number
  name: string
  registration: string
  user_type_id: number
  devices: (Device | number)[]
  email?: string
}

export interface UserAccessRule {
  id: number
  user: User
  access_rule: AccessRule
}

export interface UserGroup {
  id: number
  user: number
  group: number
}

export interface AccessLogs {
  id: number
  time: string
  event_type: number
  device: Device
  identifier_id: string
  user: User
  portal: Portal
  access_rule: AccessRule
  qr_code: string
  uhf_value: string
  pin_value: string
  card_value: string
  confidence: number
  mask: string
}
