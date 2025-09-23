<script lang="ts" setup>
  import type { AccessRule } from '@/types'
  import { ref, computed } from 'vue'
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
  watch(() => selection.value.selected, (newSelection) => {
    console.log('Seleção atualizada:', {
      selecionados: newSelection,
      quantidade: newSelection.length,
      ids: newSelection.map(item => item.id)
    })
  }, { deep: true })

  function onSelectionChanged(items: (AccessRule | number)[]) {
    // Se o item for um número, converte para objeto AccessRule
    const selectedRules = Array.isArray(items) ? items.map(item => {
      if (typeof item === 'number') {
        const rule = rules.find(r => r.id === item)
        console.log('Convertendo número para regra:', item, rule)
        return rule
      }
      return item
    }).filter(Boolean) : []

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

  function abrirHorario (rule: AccessRule) {
    selected.value = rule
    scheduleDialog.value = true
  }

  async function salvar (rule: AccessRule) {
    try {
      rule.id === 0
        ? await store.createAccessRule({ name: rule.name, type: rule.type, priority: rule.priority })
        : await store.updateAccessRule(rule.id, { name: rule.name, type: rule.type, priority: rule.priority })
      await store.loadAccessRules()
    } catch {
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
      const isValid = rule && typeof rule.id === 'number' && !isNaN(rule.id)
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
    item-value="id"
    :items="rules"
    show-select
    @update:modelValue="onSelectionChanged"
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
