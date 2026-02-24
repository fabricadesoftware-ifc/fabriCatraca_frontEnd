import type { BaseResponse, getToken, User } from '@/types'
import { api, usersApi } from '@/plugins/api'

class AuthService {
  async getToken (user: getToken): Promise<BaseResponse<getToken>> {
    try {
      const response = await api.post('token/', user)
      return response.data as BaseResponse<getToken>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getMe (): Promise<User> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await usersApi.get('users/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return response.data as User
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async refreshToken () {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      const response = await api.post('refresh/', { refresh: refreshToken })
      const { access } = response.data
      localStorage.setItem('access_token', access)
      return access
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  }
}

export default new AuthService()
