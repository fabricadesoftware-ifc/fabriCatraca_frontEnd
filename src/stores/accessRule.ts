import type { AccessRule } from '@/types'
import { defineStore } from 'pinia'
import { useUIState } from '@/composables/useUIState'
import accessRulesService from '@/services/access_rules'

export const useAccessRuleStore = defineStore('accessRule', {
  state: () => ({
    accessRules: [] as AccessRule[],
    selectedRule: null as AccessRule | null,
    loading: false,
    saving: false,
  }),

  actions: {
    async loadAccessRules () {
      const { adaptAccessRule } = useUIState()
      this.loading = true
      try {
        const response = await accessRulesService.getAccessRules()
        this.accessRules = response.results.map(rule => adaptAccessRule(rule))
      } catch (error) {
        console.error('Erro ao carregar regras de acesso:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createAccessRule (data: Partial<AccessRule>) {
      this.saving = true
      try {
        const newRule = await accessRulesService.createAccessRule(data)
        this.accessRules.push(newRule)
        return newRule
      } catch (error) {
        console.error('Erro ao criar regra de acesso:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateAccessRule (id: number, data: Partial<AccessRule>) {
      this.saving = true
      try {
        const updatedRule = await accessRulesService.updateAccessRule(id, data)
        const index = this.accessRules.findIndex(r => r.id === id)
        if (index !== -1) {
          this.accessRules[index] = updatedRule
        }
        return updatedRule
      } catch (error) {
        console.error('Erro ao atualizar regra de acesso:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteAccessRule (id: number) {
      this.saving = true
      try {
        await accessRulesService.deleteAccessRule(id)
        this.accessRules = this.accessRules.filter(r => r.id !== id)
      } catch (error) {
        console.error('Erro ao excluir regra de acesso:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    getRuleTypeColor (type: string) {
      const colors: Record<string, string> = {
        allow: 'success',
        deny: 'error',
        conditional: 'warning',
      }
      return colors[type] || 'grey'
    },

    getRuleTypeIcon (type: string) {
      const icons: Record<string, string> = {
        allow: 'mdi-check-circle',
        deny: 'mdi-close-circle',
        conditional: 'mdi-help-circle',
      }
      return icons[type] || 'mdi-shield'
    },

    getRuleTypeLabel (type: string) {
      const labels: Record<string, string> = {
        allow: 'Permitir',
        deny: 'Negar',
        conditional: 'Condicional',
      }
      return labels[type] || 'Desconhecido'
    },

    getPriorityColor (priority: number) {
      const colors: Record<number, string> = {
        1: 'grey',
        2: 'blue',
        3: 'orange',
        4: 'red',
        5: 'purple',
      }
      return colors[priority] || 'grey'
    },
  },
})
