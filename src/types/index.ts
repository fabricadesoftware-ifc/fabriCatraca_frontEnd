// Interfaces base
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
  page?: number
  limit?: number
  search?: string
  // eslint-disable-next-line @typescript-eslint/member-ordering
  [key: string]: unknown
}

// Interfaces de entidades
export interface AccessRule {
  id: number
  name: string
  description?: string
  type: string
  priority: number
  is_active: boolean
  time_zones?: TimeZone[]
  areas?: Area[]
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
}

export interface Group {
  id: number
  name: string
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
}

export interface PortalAccessRule {
  id: number
  portal: Portal
  access_rule: AccessRule
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
  devices: Device[]
}

export interface UserAccessRule {
  id: number
  user: User
  access_rule: AccessRule
}

export interface UserGroup {
  id: number
  user: User
  group: Group
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

// tipos de eventos
// 1Equipamento inválido
// 2Parâmetros de identificação inválidos
// 3Não identificado
// 4Identificação pendente
// 5Tempo de identificação esgotado
// 6Acesso negado
// 7Acesso concedido
// 8Acesso pendente (usado quando o acesso depende de mais de uma pessoa)
// 9Usuário não é administrador (usado quando um usuário tenta acessar o menu mas não é administrador)
// 10Acesso não identificado (quando o portal é aberto através da API e o motivo não é informado)
// 11Acesso por botoeira
// 12Acesso pela interface web
// 13Desistência de entrada (exclusivo para iDBlock)
// 14Sem resposta (nenhuma ação é tomada)
// 15Acesso pela interfonia (exclusivo para iDFace)
