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
  current_page: number
  total_pages: number
}

export interface QueryParams {
  [key: string]: unknown | undefined
  page?: number
  page_size?: number
  search?: string
  name?: string
  ordering?: string
  user?: number
}

export interface AccessRule {
  id: number
  name: string
  type: number
  priority: number
  time_zones: TimeZone[] | []
  areas: Area[] | []
}

export interface AccessRuleTimeZone {
  id: number
  access_rule: AccessRule
  time_zone: TimeZone
}

export interface AccessRuleTimeZoneCreate {
  access_rule_id: number
  time_zone_id: number
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

export interface BioCreate {
  user_id: number
  enrollment_device_id: number
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
  users?: User[]
  access_rules?: AccessRule[]
}

export interface GroupAccessRule {
  id: number
  group: Group
  access_rule: AccessRule
}

export interface GroupAccessRuleCreate {
  group_id: number
  access_rule_id: number
}

export interface Portal {
  id: number
  name: string
  area_from: Area
  area_to: Area
}

export interface PortalAccessRule {
  id: number
  portal: Portal
  access_rule: AccessRule
}

export interface PortalAccessRuleCreate {
  portal: number
  access_rule: number
}

export interface TimeSpan {
  id: number
  time_zone: TimeZone
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
}

export interface UserGroup {
  id: number
  user: User
  group: Group
}

export interface UserGroupCreate {
  id: number
  user: number
  group: number
}

export interface User {
  id: number
  name: string
  registration: string
  user_type_id: number
  devices: Device[]
  email?: string
  user_groups?: Group[]
}

export interface UserAccessRule {
  id: number
  user: User
  access_rule: AccessRule
}

export interface UserAccessRuleCreate {
  user: number
  access_rule: number
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
