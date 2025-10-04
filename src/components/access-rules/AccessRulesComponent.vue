<script lang="ts" setup>
  import type { AccessRule } from '@/types'
  import { computed, ref } from 'vue'
  import portalAccessRulesService from '@/services/portal_access_rules'
  import { useAccessRuleStore } from '@/stores'
  import AccessRuleDialog from './AccessRuleDialog.vue'
  import GroupScheduleDialog from './GroupScheduleDialog.vue'

  const props = defineProps<{ rules: AccessRule[] }>()
  const rules = computed(() => props.rules)

  const store = useAccessRuleStore()
  const dialog = ref(false)
  const scheduleDialog = ref(false)
  const selected = ref<AccessRule | null>(null)
  const selection = ref({ selected: [] as AccessRule[] })

  // Watch para debug da seleção
  watch(() => selection.value.selected, newSelection => {
    console.log('Seleção atualizada:', {
      selecionados: newSelection,
      quantidade: newSelection.length,
      ids: newSelection.map(item => item.id),
    })
  }, { deep: true })

  function onSelectionChanged (items: (AccessRule | number)[]) {
    // Se o item for um número, converte para objeto AccessRule
    const selectedRules = Array.isArray(items)
      ? items.map(item => {
        if (typeof item === 'number') {
          const rule = rules.value.find(r => r.id === item)
          console.log('Convertendo número para regra:', item, rule)
          return rule
        }
        return item
      }).filter((rule): rule is AccessRule => rule !== undefined)
      : []

    selection.value.selected = selectedRules
    console.log('Seleção alterada:', selection.value.selected)
  }

  const headers = [
    { title: 'ID', key: 'id', align: 'start' as const },
    { title: 'Nome', key: 'name', align: 'start' as const },
    { title: 'Tipo', key: 'type', align: 'start' as const },
    { title: 'Prioridade', key: 'priority', align: 'start' as const },
    { title: 'Ações', key: 'actions', align: 'end' as const },
  ]

  function novo () {
    selected.value = { id: 0, name: '', type: 1, priority: 1, time_zones: [], areas: [] } as unknown as AccessRule
    dialog.value = true
  }

  function showAccessRuleDetails (event: Event, { item }: { item: AccessRule }) {
    selected.value = item
    dialog.value = true
  }

  function abrirHorario (rule: AccessRule) {
    selected.value = rule
    scheduleDialog.value = true
  }

  async function salvar (rule: AccessRule) {
    try {
      const ruleData = {
        name: rule.name,
        type: rule.type,
        priority: rule.priority,
        areas: rule.areas || [],
      }

      let savedRule: AccessRule
      if (rule.id === 0) {
        const response = await store.createAccessRule(ruleData)
        savedRule = response
      } else {
        savedRule = await store.updateAccessRule(rule.id, ruleData)
      }

      // Gerenciar portals associados
      if (rule.portals && savedRule.id) {
        const portalIds = Array.isArray(rule.portals)
          ? rule.portals.map(p => typeof p === 'number' ? p : p.id)
          : []

        // Buscar relações atuais
        const currentRelations = await portalAccessRulesService.getPortalAccessRules({ access_rule: savedRule.id })
        const currentPortalIds = (currentRelations.results || [])
          .filter((rel: any) => ((rel?.access_rule?.id ?? rel?.access_rule) === savedRule.id))
          .map((rel: any) => ({
            id: rel.id,
            portalId: rel?.portal?.id ?? rel?.portal,
          }))

        // Adicionar novos portals
        const portalsToAdd = portalIds.filter(
          portalId => !currentPortalIds.some((rel: any) => rel.portalId === portalId),
        )
        for (const portalId of portalsToAdd) {
          await portalAccessRulesService.createPortalAccessRule({
            portal: portalId,
            access_rule: savedRule.id,
          })
        }

        // Remover portals desassociados
        const portalsToRemove = currentPortalIds.filter(
          (rel: any) => !portalIds.includes(rel.portalId),
        )
        for (const rel of portalsToRemove) {
          await portalAccessRulesService.deletePortalAccessRule(rel.id)
        }
      }

      await store.loadAccessRules()
    } catch (error) {
      console.error('Erro ao salvar regra:', error)
      alert('Erro ao salvar regra')
    }
  }

  async function removerSelecionadas () {
    console.log('Iniciando remoção. Selecionados:', selection.value.selected)

    if (!selection.value.selected || selection.value.selected.length === 0) {
      alert('Nenhuma regra selecionada para remoção')
      return
    }

    // Filtra apenas regras com IDs válidos
    const validRules = selection.value.selected.filter(rule => {
      // Se for um número, converte para regra
      if (typeof rule === 'number') {
        const foundRule = rules.value.find(r => r.id === rule)
        if (!foundRule) {
          console.warn('Regra não encontrada para ID:', rule)
          return false
        }
        return true
      }

      // Se for um objeto, verifica se tem ID válido
      const isValid = rule && typeof rule.id === 'number' && !Number.isNaN(rule.id)
      if (!isValid) {
        console.warn('Regra inválida encontrada:', rule)
      }
      return isValid
    })

    console.log('Regras válidas:', validRules)

    if (validRules.length === 0) {
      alert('Nenhuma regra válida selecionada para remoção')
      return
    }

    // Extrai os IDs, convertendo números para objetos se necessário
    const ids = validRules.map(rule => {
      if (typeof rule === 'number') {
        return rule
      }
      return rule.id
    })

    console.log('IDs para remover:', ids)

    if (!confirm(`Remover ${ids.length} regra(s)?`)) return

    try {
      await Promise.all(ids.map(id => store.deleteAccessRule(id)))
      await store.loadAccessRules()
      selection.value.selected = []
    } catch (error) {
      console.error('Erro ao remover regras:', error)
      alert('Erro ao remover regras')
    }
  }
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">Regras de Acesso</h2>
    <div>
      <v-btn
        class="mr-2"
        color="error"
        :disabled="selection.selected.length === 0"
        prepend-icon="mdi-delete"
        @click="removerSelecionadas"
      >
        Remover Selecionadas
      </v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="novo">Adicionar Regra</v-btn>
    </div>
  </div>

  <v-data-table
    v-model="selection.selected"
    class="rounded-lg"
    :headers="headers"
    hover
    item-value="id"
    :items="rules"
    show-select
    @click:row="showAccessRuleDetails"
    @update:model-value="onSelectionChanged"
  >
    <template #item.actions="{ item }">
      <v-btn
        color="primary"
        size="small"
        variant="text"
        @click="abrirHorario(item)"
      >
        Horários por Turma
      </v-btn>
    </template>
  </v-data-table>

  <AccessRuleDialog v-model="dialog" :rule="selected" @save="salvar" />
  <GroupScheduleDialog v-model="scheduleDialog" :access-rule="selected" @saved="store.loadAccessRules()" />
</template>
