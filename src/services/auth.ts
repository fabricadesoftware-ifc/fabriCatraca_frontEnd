import type { BaseResponse, getToken } from '@/types'
import { api } from '@/plugins/api'
import { usersApi  } from '@/plugins/api'

class AuthService {
  async getToken(user: getToken): Promise<BaseResponse<getToken>> {
    try {
      const response = await api.post('token/', user)
      return response.data as BaseResponse<getToken>
    } catch (error) {
      console.error('❌ Erro ao buscar logs de acesso dos últimos dias:', error)
      throw error
    }
  }

  async getMe(): Promise<BaseResponse<getToken>> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await usersApi.get('users/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return response.data as BaseResponse<getToken>
    } catch (error) {
      console.error('❌ Erro ao buscar logs de acesso dos últimos dias:', error)
      throw error
    }
  }
}

export default new AuthService()
