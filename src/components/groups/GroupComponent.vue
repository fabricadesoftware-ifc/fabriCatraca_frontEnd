<script lang="ts" setup>
  import type { AccessRule, Group as BaseGroup } from '@/types'
  import { computed, ref } from 'vue'
  import { toast } from 'vue3-toastify'
  import groupAccessRulesService from '@/services/group_access_rules'
  import { useGroupStore } from '@/stores'
  import GroupDialog from './GroupDialog.vue'

  interface Group extends Omit<BaseGroup, 'access_rules'> {
    access_rules?: (number | AccessRule)[]
  }

  const { groups, currentPage, pageSize, totalPages, totalItems, app_role } = defineProps<{
    groups: Group[]
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
    app_role: string
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

  // Headers por role — sisae não vê "Regras de Acesso"
  const DefaultHeaders = [
    { title: 'ID', key: 'id', align: 'start' as const },
    { title: 'Turma', key: 'name', align: 'start' as const },
    { title: 'Usuários', key: 'users', align: 'start' as const },
    { title: 'Regras de Acesso', key: 'access_rules', align: 'start' as const },
  ]

  const HeadersByRole: Record<string, typeof DefaultHeaders> = {
    admin: DefaultHeaders,
    sisae: DefaultHeaders.filter(h => h.key !== 'access_rules'),
  }

  const tableHeaders = computed(
    () => HeadersByRole[app_role] ?? DefaultHeaders,
  )

  function normalizeAccessRules (access_rules: Group['access_rules']) {
    const rules = access_rules || []
    if (rules.length === 0) return []
    // New format: array of { access_rule_id, portal_group_id }
    if (typeof rules[0] === 'object' && 'access_rule_id' in rules[0]) {
      return rules as unknown as Array<{ access_rule_id: number, portal_group_id: number | null }>
    }
    // Old format: array of numbers or AccessRule objects
    return rules.map(r => ({
      access_rule_id: typeof r === 'number' ? r : r.id,
      portal_group_id: null as number | null,
    }))
  }

  async function salvarGrupo (group: Group) {
    try {
      let savedGroup: Group

      if (group.id === 0) {
        savedGroup = await groupStore.createGroup({ name: group.name })
        const desiredRules = normalizeAccessRules(group.access_rules)
        for (const rule of desiredRules) {
          await groupStore.addAccessRuleToGroup(savedGroup.id, rule.access_rule_id, rule.portal_group_id)
        }
      } else {
        const currentGroup = await groupStore.getGroupById(group.id)
        if (!currentGroup) throw new Error('Grupo não encontrado')

        const basicDataChanged = currentGroup.name !== group.name
        savedGroup = basicDataChanged
          ? await groupStore.updateGroup(group.id, { name: group.name })
          : currentGroup

        const desiredRules = normalizeAccessRules(group.access_rules)
        const desiredRuleIds = new Set(desiredRules.map(r => r.access_rule_id))

        // Fetch current relations from server to include portal_group info
        const relations = await groupAccessRulesService.getGroupAccessRules({ group_id: group.id })
        const currentRelations = (relations.results || [])
          .filter((rel: any) => ((rel?.group?.id ?? rel?.group_id) === group.id))
          .map((rel: any) => ({
            ruleId: rel?.access_rule?.id ?? rel?.access_rule_id,
            portalGroupId: rel?.portal_group?.id ?? rel?.portal_group_id ?? null,
            relationId: rel.id,
          }))

        // Check which rules match by (access_rule_id, portal_group_id)
        const currentKeySet = new Set(
          currentRelations.filter(r => r.ruleId).map(r => `${r.ruleId}-${r.portalGroupId}`)
        )
        const desiredKeySet = new Set(
          desiredRules.map(r => `${r.access_rule_id}-${r.portal_group_id}`)
        )

        const rulesToAdd = desiredRules.filter(r => !currentKeySet.has(`${r.access_rule_id}-${r.portal_group_id}`))
        const rulesToRemove = currentRelations.filter(r => r.ruleId && !desiredKeySet.has(`${r.ruleId}-${r.portalGroupId}`))

        for (const rule of rulesToAdd) {
          await groupStore.addAccessRuleToGroup(group.id, rule.access_rule_id, rule.portal_group_id)
        }
        for (const rel of rulesToRemove) {
          if (rel.relationId != null) {
            await groupAccessRulesService.deleteGroupAccessRule(rel.relationId)
          }
        }
      }

      await groupStore.loadGroups()
      toast.success('Grupo salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar grupo:', error)
      toast.error('Erro ao salvar grupo. Por favor, tente novamente.')
    }
  }

  async function showGroupDetails (event: Event, { item }: { item: Group }) {
    if (app_role === 'sisae') {
      selectedGroup.value = item
      dialog.value = true
      return
    }

    try {
      const fullGroup = await groupStore.getGroupById(item.id)
      const relations = await groupAccessRulesService.getGroupAccessRules({ group_id: item.id })
      const rulesWithPortalGroup = (relations.results || [])
        .filter((rel: any) => ((rel?.group?.id ?? rel?.group_id) === item.id))
        .map((rel: any) => ({
          access_rule_id: rel?.access_rule?.id ?? rel?.access_rule_id,
          portal_group_id: rel?.portal_group?.id ?? rel?.portal_group_id ?? null,
        }))
        .filter((r: any) => typeof r.access_rule_id === 'number')

      const accessRules = rulesWithPortalGroup.length > 0
        ? rulesWithPortalGroup
        : ((fullGroup as any)?.access_rules || []).map((r: any) => typeof r === 'number' ? { access_rule_id: r, portal_group_id: null } : { access_rule_id: r.id, portal_group_id: null })

      selectedGroup.value = Object.assign({}, item, fullGroup || {}, { access_rules: accessRules })
    } catch {
      selectedGroup.value = item
    } finally {
      dialog.value = true
    }
  }

  async function removerSelecionados () {
    const selectedItems = selection.value.selected
    if (selectedItems.length === 0) return

    if (confirm(`Remover ${selectedItems.length} grupo(s)?`)) {
      try {
        const validGroups = selectedItems.filter(group => typeof group.id === 'number' && !Number.isNaN(group.id))
        if (validGroups.length === 0) throw new Error('Nenhum grupo válido para remover')

        await Promise.all(validGroups.map(group => groupStore.deleteGroup(group.id)))
        await groupStore.loadGroups()

        selection.value.selected = []
        toast.success(`${validGroups.length} grupo(s) removido(s) com sucesso!`)
      } catch (error) {
        console.error('Erro ao remover grupos:', error)
        toast.error('Erro ao remover grupos. Por favor, tente novamente.')
      }
    }
  }

  function novoGrupo () {
    selectedGroup.value = { id: 0, name: '', users: [], access_rules: [] }
    dialog.value = true
  }

  function trocarPagina (page: number) { emit('page-changed', page) }
  function itemsPerPageChanged (newPageSize: number) { emit('item-per-page', newPageSize) }

  function onSelect (items: Group[]) {
    const selectedItems = Array.isArray(items) ? items : [items].filter(Boolean)
    selection.value.selected = selectedItems.length > 0
      ? selectedItems.map(item => ({ ...item, id: Number(item.id) }))
      : []
  }
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">{{ app_role === 'sisae' ? 'Liberar Turma' : 'Gerenciar Grupos' }}</h2>

    <div v-if="app_role === 'admin'">
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
    :headers="tableHeaders"
    hover
    item-key="id"
    :items="groups"
    :items-length="totalItems ?? 0"
    :items-per-page="pageSize ?? 10"
    :loading="groups.length === 0"
    :page="currentPage ?? 1"
    return-object
    :select-strategy="app_role === 'admin' ? 'all' : 'single'"
    :show-select="app_role === 'admin'"
    @click:row="showGroupDetails"
    @update:items-per-page="itemsPerPageChanged"
    @update:page="trocarPagina"
    @update:selected="onSelect"
  >
    <template #item.users="{ item }">
      {{ item.users?.length || 0 }} usuário(s)
    </template>

    <template #item.access_rules="{ item }">
      {{ item.access_rules?.length || 0 }} regra(s)
    </template>
  </v-data-table-server>

  <!-- GroupDialog usado por todos os roles — app_role controla o que é visível dentro -->
  <GroupDialog
    v-model="dialog"
    :app_role="app_role"
    :group="selectedGroup"
    @save="salvarGrupo"
  />
</template>

<style scoped>
/* O Vuetify já cuida do hover quando você usa hover="true" */
.v-data-table :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
</style>
