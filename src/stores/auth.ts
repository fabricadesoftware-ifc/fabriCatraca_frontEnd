import { defineStore } from 'pinia'
import { AuthService } from '@/services'
import type { getToken } from '@/types'
import { showMessage } from '@/utils/showmsg'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    me: [],
    access: '' as string,
    refresh: '' as string,
    loading: false as boolean,
    error: null as string | null,
  }),

  getters: {
    user: (state) => state.me,
    isAuthenticated: (state) => !!state.access,
    getAccessToken: (state) => state.access,
    getRefreshToken: (state) => state.refresh,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },

  actions: {
    async GetToken(user: getToken) {
      this.loading = true
      try {
        const response = await AuthService.getToken(user)
        this.access = response.access
        this.refresh = response.refresh
        localStorage.setItem('access_token', this.access)
        localStorage.setItem('refresh_token', this.refresh)
        console.log('Token obtido com sucesso:', response)
      } catch (error) {
        console.error('Erro ao se logar:', error)
        showMessage('Erro ao se logar, verifique suas credenciais!', 'error', 1500, 'top-right')
        this.error = error
        throw error
      } finally {
        if(!this.error){
          showMessage('logado com sucesso', 'success', 1500, 'top-right')
          router.push('/')
        }
        this.loading = false
        this.error = null
      }
    },
    async getMe() {
      this.loading = true
      try {
        const response = await AuthService.getMe()
        this.me = response
        console.log('Usuário carregado com sucesso:', response)
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async takeDatas(user: Array) {
      const values = user.map(u => u.value)
      const User: Object = {
        email: values[0],
        password: values[1],
      }
      await this.GetToken(User)
    },
  },
},
)
