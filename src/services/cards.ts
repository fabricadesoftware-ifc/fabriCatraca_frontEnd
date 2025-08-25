import type { BaseResponse, Card, PaginatedResponse, QueryParams } from '@/types'
import { controlIdApi as api } from '@/plugins/api'

class CardsService {
  async getCards (params?: QueryParams): Promise<PaginatedResponse<Card>> {
    try {
      const response = await api.get('/cards/', { params })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getCardById (id: number): Promise<BaseResponse<Card>> {
    try {
      const response = await api.get(`/cards/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async createCard (data: Partial<Card>): Promise<BaseResponse<Card>> {
    try {
      const response = await api.post('/cards/', data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updateCard (id: number, data: Partial<Card>): Promise<BaseResponse<Card>> {
    try {
      const response = await api.patch(`/cards/${id}/`, data)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deleteCard (id: number): Promise<BaseResponse<void>> {
    try {
      const response = await api.delete(`/cards/${id}/`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new CardsService()
