import { controlIdApi as api } from '@/plugins/api'

export interface MessageToScreenPayload {
  device_ids: number[]
  message: string
  timeout: number
}

export interface BuzzerBuzzPayload {
  device_ids: number[]
  frequency: number
  duty_cycle: number
  timeout: number
}

export interface RemoteUserAuthorizationPayload {
  device_ids: number[]
  event: number
  user_id: number
  user_name: string
  user_image: boolean
  portal_id: number
  actions: Array<{ action: string; parameters: string }>
}

class DeviceActionsService {
  async messageToScreen (payload: MessageToScreenPayload) {
    try {
      const response = await api.post('/devices/actions/message_to_screen/', payload)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async buzzerBuzz (payload: BuzzerBuzzPayload) {
    try {
      const response = await api.post('/devices/actions/buzzer_buzz/', payload)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async remoteUserAuthorization (payload: RemoteUserAuthorizationPayload) {
    try {
      const response = await api.post('/devices/actions/remote_user_authorization/', payload)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new DeviceActionsService()
