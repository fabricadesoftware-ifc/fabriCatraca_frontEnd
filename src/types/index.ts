export interface BaseResponse<T> {
  refresh: string;
  access: string;
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page_size: number;
  current_page: number;
  total_pages: number;
}

export interface QueryParams {
  [key: string]: unknown | undefined;
  page?: number;
  page_size?: number;
  search?: string;
  name?: string;
  ordering?: string;
  user?: number;
}

export interface AccessRule {
  data: any;
  id: number;
  name: string;
  type: number;
  priority: number;
  time_zones: TimeZone[] | [];
  areas: Area[] | [];
  portals?: Portal[] | number[] | [];
}

export interface AccessRuleTimeZone {
  id: number;
  access_rule: AccessRule;
  time_zone: TimeZone;
}

export interface AccessRuleTimeZoneCreate {
  access_rule_id: number;
  time_zone_id: number;
}

export interface Area {
  id: number;
  name: string;
}

export interface AreaCreate {
  name: string;
}

export interface AreaAccessRule {
  id: number;
  area: Area;
  access_rule: AccessRule;
}

export interface Bio {
  id: number;
  user: number;
  template: string;
  finger_type: number;
  finger_position: number;
  devices: Device[];
}

export interface BioCreate {
  user_id: number;
  enrollment_device_id: number;
}

export interface Card {
  id: number;
  number: string;
  value: number;
  user: User;
  devices: Device[];
}

export interface CardCreate {
  user_id: number;
  enrollment_device_id: number;
}

export interface Device {
  id: number;
  name: string;
  ip: string;
  username: string;
  password?: string;
  is_active: boolean;
  is_default: boolean;
  status?: string;
  updating?: boolean;
}

export interface DeviceRegistryItem {
  id: number;
  name: string;
  ip: string;
}

export interface DeviceRegistryRow {
  id: number;
  status: "ok" | "divergente" | "faltando" | "extra" | string;
  expected?: DeviceRegistryItem | null;
  remote?: DeviceRegistryItem | null;
}

export interface DeviceRegistryReport {
  device_id: number;
  device_name: string;
  expected_count: number;
  remote_count: number;
  rows: DeviceRegistryRow[];
}

export interface DeviceLogoSlot {
  slot_id: number;
  has_logo: boolean;
  is_active: boolean;
  content_type?: string | null;
}

export interface DeviceLogoSummary {
  device_id: number;
  device_name: string;
  active_slot: number;
  slots: DeviceLogoSlot[];
}

export interface Group {
  id: number;
  name: string;
  users?: User[];
  access_rules?: AccessRule[];
}

export interface GroupCreate {
  name: string;
}

export interface GroupAccessRule {
  id: number;
  group: Group;
  access_rule: AccessRule;
}

export interface GroupAccessRuleCreate {
  group_id: number;
  access_rule_id: number;
}

export interface Portal {
  id: number;
  name: string;
  area_from: Area;
  area_to: Area;
}

export interface PortalAccessRule {
  id: number;
  portal: Portal;
  access_rule: AccessRule;
}

export interface PortalAccessRuleCreate {
  portal_id: number;
  access_rule_id: number;
}

export interface TimeSpan {
  id: number;
  time_zone: TimeZone;
  start: number;
  end: number;
  sun: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  hol1: boolean;
  hol2: boolean;
  hol3: boolean;
}

export interface TimeZone {
  id: number;
  name: string;
}

export interface UserGroup {
  id: number;
  user: User;
  group: Group;
}

export interface UserGroupCreate {
  id: number;
  user: number;
  group: number;
}

export interface User {
  id: number;
  name: string;
  registration: string;
  user_type_id: number;
  pin?: string;
  device_admin?: boolean;
  devices: Device[];
  email?: string;
  user_groups?: Group[];
}

export interface UserAccessRule {
  id: number;
  user: User;
  access_rule: AccessRule;
}

export interface UserAccessRuleCreate {
  user: number;
  access_rule: number;
}

export interface AccessLogs {
  id: number;
  time: string;
  event_type: number;
  device: Device;
  identifier_id: string;
  user: User;
  portal: Portal;
  access_rule: AccessRule;
  qr_code: string;
  uhf_value: string;
  pin_value: string;
  card_value: string;
  confidence: number;
  mask: string;
}

export interface getToken {
  email: string;
  password: string;
}

export interface AuthState {
  access: string | null;
  refresh: string | null;
  loading: boolean;
  error: Error | null;
}

export interface SystemConfig {
  id?: number;
  device: number;
  device_name?: string;
  online?: boolean;
  auto_reboot_hour?: number;
  auto_reboot_minute?: number;
  catra_timeout?: number;
  local_identification?: boolean;
  language?: "pt_BR" | "en_US" | "spa_SPA" | string;
  daylight_savings_time_start?: string;
  daylight_savings_time_end?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HardwareConfig {
  id?: number;
  device: number;
  device_name?: string;
  beep_enabled?: boolean;
  bell_enabled?: boolean;
  bell_relay?: number;
  network_interlock_enabled?: boolean;
  network_interlock_api_bypass_enabled?: boolean;
  network_interlock_rex_bypass_enabled?: boolean;
  exception_mode?: "none" | "emergency" | "lock_down";
  siren_enabled?: boolean;
  siren_relay?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SecurityConfig {
  id?: number;
  device: number;
  device_name?: string;
  password_only?: boolean;
  hide_password_only?: boolean;
  password_only_tip?: string;
  hide_name_on_identification?: boolean;
  denied_transaction_code?: string;
  send_code_when_not_identified?: boolean;
  send_code_when_not_authorized?: boolean;
  verbose_logging?: boolean;
  log_type?: boolean;
  multi_factor_authentication?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UIConfig {
  id?: number;
  device: number;
  device_name?: string;
  screen_always_on?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CatraConfig {
  id?: number;
  device: number;
  device_name?: string;
  anti_passback?: boolean;
  daily_reset?: boolean;
  gateway?: "clockwise" | "anticlockwise";
  operation_mode?: "blocked" | "entrance_open" | "exit_open" | "both_open";
  created_at?: string;
  updated_at?: string;
}

export interface PushServerConfig {
  id?: number;
  device: number;
  device_name?: string;
  push_request_timeout?: number;
  push_request_period?: number;
  push_remote_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonitorConfig {
  id?: number;
  device: number;
  device_name?: string;
  hostname: string;
  port: string;
  path?: string;
  request_timeout?: number;
  heartbeat_timeout_seconds?: number;
  last_seen_at?: string | null;
  last_payload_at?: string | null;
  last_signal_source?: string;
  offline_since?: string | null;
  is_offline?: boolean;
  is_configured?: boolean;
  full_url?: string;
  notification_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonitorAlert {
  id: number;
  type: string;
  severity: "info" | "warning" | "error" | string;
  title: string;
  message: string;
  device?: number | null;
  device_name?: string;
  user?: number | null;
  user_name?: string;
  dedupe_key?: string;
  metadata?: Record<string, unknown>;
  started_at: string;
  resolved_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface MonitorAlertSummary {
  unread_count: number;
  active_count: number;
  total_count: number;
}

// Easy Setup
export interface EasySetupDevice {
  id: number;
  name: string;
  ip: string;
  is_default: boolean;
  user_count: number;
  monitor_configured: boolean;
  monitor_url: string;
  selected: boolean;
}

export interface EasySetupListResponse {
  devices: EasySetupDevice[];
  total: number;
  hint: string;
}

export interface EasySetupStepResult {
  ok: boolean;
  status?: number;
  count?: number;
  skipped?: boolean;
  datetime?: string;
  full_url?: string;
  [key: string]: unknown;
}

export interface EasySetupCleanResult {
  access_logs: EasySetupStepResult;
  users: EasySetupStepResult;
  groups: EasySetupStepResult;
  [key: string]: EasySetupStepResult;
}

export interface EasySetupPushResult {
  users: EasySetupStepResult;
  user_roles: EasySetupStepResult;
  pins: EasySetupStepResult;
  groups: EasySetupStepResult;
  time_zones: EasySetupStepResult;
  time_spans: EasySetupStepResult;
  access_rules: EasySetupStepResult;
  areas: EasySetupStepResult;
  portals: EasySetupStepResult;
  user_groups: EasySetupStepResult;
  user_access_rules: EasySetupStepResult;
  group_access_rules: EasySetupStepResult;
  access_rule_time_zones: EasySetupStepResult;
  portal_access_rules: EasySetupStepResult;
  cards: EasySetupStepResult;
  templates: EasySetupStepResult;
  [key: string]: EasySetupStepResult;
}

export interface EasySetupDeviceResult {
  device: string;
  steps: {
    login: EasySetupStepResult;
    clean: EasySetupCleanResult;
    datetime: EasySetupStepResult;
    monitor: EasySetupStepResult;
    push: EasySetupPushResult;
  };
  elapsed_s: number;
  summary: {
    records_pushed: number;
    tables_with_errors: number;
  };
}

export interface EasySetupResponse {
  success: boolean;
  message: string;
  devices_ok: number;
  devices_total: number;
  results: EasySetupDeviceResult[];
}

export interface EasySetupErrorResponse {
  error: string;
}

// Easy Setup Assíncrono
export interface EasySetupAsyncResponse {
  task_id: string;
  message: string;
  device_ids: number[];
  status_url: string;
}

export interface EasySetupStatusDevice {
  device_name: string;
  status: "pending" | "running" | "success" | "partial" | "failed";
  report?: EasySetupDeviceResult;
}

export interface EasySetupStatusResponse {
  task_id: string;
  overall_status: "pending" | "running" | "success" | "partial" | "failed";
  completed: number;
  total: number;
  devices: EasySetupStatusDevice[];
}

export interface EasySetupHistoryEntry {
  task_id: string;
  status: "pending" | "running" | "success" | "partial" | "failed";
  device_count: number;
  started_at: string;
  finished_at: string | null;
}

export interface EasySetupHistoryResponse {
  results: EasySetupHistoryEntry[];
}

// Cards com base em biometria
export interface CardFromBioPayload {
  user_id: number;
  card_number: string;
  card_value: number;
  device_ids?: number[];
}

export interface TemporaryReleaseActor {
  id: number;
  name: string;
  registration?: string | null;
}

export interface TemporaryReleaseRule {
  id: number;
  name: string;
  type: number;
  priority: number;
}

export interface TemporaryReleaseLog {
  id: number;
  time: string;
  event_type: number;
  device_name?: string;
  portal_name?: string;
}

export interface TemporaryUserRelease {
  id: number;
  user: TemporaryReleaseActor;
  requested_by: TemporaryReleaseActor;
  access_rule: TemporaryReleaseRule;
  status: "pending" | "active" | "consumed" | "expired" | "cancelled" | "failed";
  valid_from: string;
  valid_until: string;
  activated_at: string | null;
  consumed_at: string | null;
  closed_at: string | null;
  consumed_log: TemporaryReleaseLog | null;
  notes: string;
  result_message: string;
  created_at: string;
  updated_at: string;
}

export interface TemporaryUserReleaseCreatePayload {
  user_id: number;
  duration_minutes: number;
  notes?: string;
}
