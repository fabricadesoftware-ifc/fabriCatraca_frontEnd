<script lang="ts" setup>
  import type { Group as BaseGroup } from '@/types'
  import { ref, watch } from 'vue'
  import { useGroupStore } from '@/stores'

  interface Group extends BaseGroup {
    access_rules?: (number | { id: number, name: string })[]
  }

  defineProps<{
    groups: Group[]
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
  }>()

  const emit = defineEmits<{
    (e: 'page-changed' | 'item-per-page', value: number): void
  }>()

  const groupStore = useGroupStore()
  const dialog = ref(false)
  const selectedGroup = ref<Group | null>(null)
  const selection = ref({
    selected: [] as Group[],
  })

  const headers = [
    { title: 'ID', key: 'id', align: 'start' as const },
    { title: 'Nome', key: 'name', align: 'start' as const },
    { title: 'Usuários', key: 'users', align: 'start' as const },
    { title: 'Regras de Acesso', key: 'access_rules', align: 'start' as const },
  ]

  // Debug para verificar se a seleção está funcionando
  watch(() => selection.value.selected, newSelected => {
    console.log('Seleção atualizada:', {
      items: newSelected,
      count: newSelected.length,
      ids: newSelected.map(item => item.id),
    })
  }, { deep: true })

  async function salvarGrupo (group: Group) {
    try {
      let savedGroup: Group

      if (group.id === 0) {
        // Criar novo grupo
        savedGroup = await groupStore.createGroup({
          name: group.name,
        })

        const groupAccessRuleIds = (group.access_rules || []).map(r => typeof r === 'number' ? r : r.id)
        for (const accessRuleId of groupAccessRuleIds) {
          await groupStore.addAccessRuleToGroup(savedGroup.id, accessRuleId)
        }
      } else {
        // Para grupo existente, verificar se dados básicos mudaram
        const currentGroup = await groupStore.getGroupById(group.id)

        if (!currentGroup) {
          throw new Error('Grupo não encontrado')
        }

        const basicDataChanged = currentGroup.name !== group.name

        // Atualizar dados básicos apenas se mudaram
        savedGroup = basicDataChanged
          ? await groupStore.updateGroup(group.id, {
            name: group.name,
          })
          : currentGroup

        // Gerenciar regras de acesso do grupo
        const groupAccessRuleIds = (group.access_rules || []).map(r => typeof r === 'number' ? r : r.id)
        const currentAccessRules = (currentGroup as any).access_rules?.map((r: any) => typeof r === 'number' ? r : r.id) || []

        const rulesToAdd = groupAccessRuleIds.filter((ruleId: number) => !currentAccessRules.includes(ruleId))
        const rulesToRemove = currentAccessRules.filter((ruleId: number) => !groupAccessRuleIds.includes(ruleId))

        // Adiciona novas regras
        for (const ruleId of rulesToAdd) {
          await groupStore.addAccessRuleToGroup(group.id, ruleId)
        }

        // Remove regras
        for (const ruleId of rulesToRemove) {
          await groupStore.removeAccessRuleFromGroup(group.id, ruleId)
        }
      }

      // Recarrega a lista de grupos
      await groupStore.loadGroups()
    } catch (error) {
      console.error('Erro ao salvar grupo:', error)
      alert('Erro ao salvar grupo. Por favor, tente novamente.')
    }
  }

  function showGroupDetails (event: Event, { item }: { item: Group }) {
    selectedGroup.value = item
    dialog.value = true
  }

  async function removerSelecionados () {
    const selectedItems = selection.value.selected
    if (selectedItems.length === 0) return

    if (confirm(`Remover ${selectedItems.length} grupo(s)?`)) {
      try {
        // Filtrar apenas grupos com ID válido
        const validGroups = selectedItems.filter(group => typeof group.id === 'number' && !Number.isNaN(group.id))
        if (validGroups.length === 0) {
          throw new Error('Nenhum grupo válido para remover')
        }

        // Deletar cada grupo selecionado
        await Promise.all(validGroups.map(group => groupStore.deleteGroup(group.id)))
        // Recarregar a lista após deletar
        await groupStore.loadGroups()

        // Limpar seleção
        selection.value.selected = []
      } catch (error) {
        console.error('Erro ao remover grupos:', error)
        alert('Erro ao remover grupos. Por favor, tente novamente.')
      }
    }
  }

  function novoGrupo () {
    selectedGroup.value = {
      id: 0,
      name: '',
      users: [],
      access_rules: [],
    }
    dialog.value = true
  }

  function trocarPagina (page: number) {
    emit('page-changed', page)
  }

  function itemsPerPageChanged (newPageSize: number) {
    emit('item-per-page', newPageSize)
  }

  function onSelect (items: Group[]) {
    // Garantir que temos um array
    const selectedItems = Array.isArray(items) ? items : [items].filter(Boolean)
    // Atualizar seleção apenas se tivermos itens válidos
    selection.value.selected = selectedItems.length > 0
      ? selectedItems.map(item => ({
        ...item,
        id: Number(item.id), // Garantir que o ID é um número
      }))
      : []
  }
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">Gerenciar Grupos</h2>

    <div>
      <!-- Debug visual (remova depois que funcionar) -->
      <span class="mr-2 text-caption">Selecionados: {{ selection.selected.length }}</span>

      <v-btn
        class="mr-2"
        color="error"
        :disabled="selection.selected.length === 0"
        prepend-icon="mdi-delete"
        @click="removerSelecionados"
      >
        Remover Selecionados
      </v-btn>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="novoGrupo"
      >
        Adicionar Grupo
      </v-btn>
    </div>
  </div>

  <v-data-table-server
    v-model="selection.selected"
    class="rounded-lg"
    :headers="headers"
    hover
    item-key="id"
    :items="groups"
    :items-length="totalItems ?? 0"
    :items-per-page="pageSize ?? 10"
    :loading="groups.length === 0"
    :page="currentPage ?? 1"
    return-object
    select-strategy="all"
    show-select
    @click:row="showGroupDetails"
    @update:items-per-page="itemsPerPageChanged"
    @update:page="trocarPagina"
    @update:selected="onSelect"
  >
    <!-- Template para users -->
    <template #item.users="{ item }">
      {{ item.users?.length || 0 }} usuário(s)
    </template>

    <!-- Template para access_rules -->
    <template #item.access_rules="{ item }">
      {{ item.access_rules?.length || 0 }} regra(s)
    </template>
  </v-data-table-server>

  <GroupDialog
    v-model="dialog"
    :group="selectedGroup"
    @save="salvarGrupo"
  />
</template>

<style scoped>
/* O Vuetify já cuida do hover quando você usa hover="true" */
.v-data-table >>> tbody tr {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
</style>
