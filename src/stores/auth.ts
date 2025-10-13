import type { getToken, User } from '@/types'
import { defineStore } from 'pinia'
import router from '@/router'
import { AuthService } from '@/services'
import { showMessage } from '@/utils/showmsg'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    me: null as User | null,
    access: '' as string,
    refresh: '' as string,
    loading: false as boolean,
    error: null as string | null,
  }),

  getters: {
    user: state => state.me,
    isAuthenticated: state => !!state.access,
    getAccessToken: state => state.access,
    getRefreshToken: state => state.refresh,
    isLoading: state => state.loading,
    getError: state => state.error,
  },

  actions: {
    async GetToken (user: getToken) {
      this.loading = true
      try {
        const response = await AuthService.getToken(user)
        this.access = response.access
        this.refresh = response.refresh
        localStorage.setItem('access_token', this.access)
        localStorage.setItem('refresh_token', this.refresh)
      } catch (error) {
        console.error(error)
        showMessage('Erro ao se logar, verifique suas credenciais!', 'error', 1500, 'top-right')
        this.error = error instanceof Error ? error.message : String(error)
        throw error
      } finally {
        if (!this.error) {
          showMessage('logado com sucesso', 'success', 1500, 'top-right')
          router.push('/')
        }
        this.loading = false
        this.error = null
      }
    },
    async getMe () {
      this.loading = true
      try {
        const response = await AuthService.getMe()
        this.me = response
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async takeDatas (user: Array<{ value: getToken }>) {
      const values = user.map((u: { value: any }) => u.value)
      const User: getToken = {
        email: values[0],
        password: values[1],
      }
      await this.GetToken(User)
    },
    logout () {
      this.me = null
      this.access = ''
      this.refresh = ''
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/login')
      showMessage('Deslogado com sucesso', 'success', 1500, 'top-right')
    },
  },
})
