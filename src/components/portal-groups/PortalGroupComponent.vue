<script setup lang="ts">
  import { ref } from 'vue'
  import { toast } from 'vue3-toastify'
  import { usePortalGroupStore } from '@/stores/portalGroup'
  import PortalGroupDialog from './PortalGroupDialog.vue'
  import type { PortalGroup } from '@/types/portal-groups'

  const selectedGroup = ref<Partial<PortalGroup>>({ id: 0, name: '' })
  const dialog = ref(false)

  const props = defineProps<{
    portalGroups: PortalGroup[]
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
  }>()

  const emit = defineEmits<{
    (e: 'page-changed', value: number): void
    (e: 'item-per-page', value: number): void
  }>()

  const portalGroupStore = usePortalGroupStore()

  const headers = [
    { title: 'ID', key: 'id', align: 'start' as const },
    { title: 'Nome', key: 'name', align: 'start' as const },
    { title: 'Descrição', key: 'description', align: 'start' as const },
    { title: 'Catracas', key: 'device_count', align: 'center' as const },
    { title: 'Status', key: 'is_active', align: 'center' as const },
  ]

  const selection = ref({
    selected: [] as PortalGroup[],
  })

  async function salvarGrupo (data: Partial<PortalGroup & { device_ids?: number[] }>) {
    try {
      if ('id' in data && data.id) {
        await portalGroupStore.updatePortalGroup(data.id, data)
        toast.success('Grupo atualizado com sucesso!')
      } else {
        await portalGroupStore.createPortalGroup(data as any)
        toast.success('Grupo criado com sucesso!')
      }
      await portalGroupStore.loadPortalGroups()
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.detail || error.message || 'Erro ao salvar grupo.')
    }
  }

  async function removerSelecionados () {
    const selectedItems = selection.value.selected
    if (selectedItems.length === 0) return

    if (confirm(`Desativar ${selectedItems.length} grupo(s)?`)) {
      try {
        const validGroups = selectedItems.filter(g => typeof g.id === 'number' && !Number.isNaN(g.id))
        if (validGroups.length === 0) throw new Error('Nenhum grupo válido para remover')

        await Promise.all(validGroups.map(g => portalGroupStore.deletePortalGroup(g.id)))
        await portalGroupStore.loadPortalGroups()

        selection.value.selected = []
        toast.success(`${validGroups.length} grupo(s) desativado(s) com sucesso!`)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao desativar grupos. Por favor, tente novamente.')
      }
    }
  }

  function showGroupDetails (event: Event, { item }: { item: PortalGroup }) {
    selectedGroup.value = item
    dialog.value = true
  }

  function ChangePage (page: number) {
    emit('page-changed', page)
  }

  function itemsPerPageChanged (newPageSize: number) {
    emit('item-per-page', newPageSize)
  }

  function getDeviceCount (group: PortalGroup) {
    return group.devices?.length || 0
  }
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">Gerenciar Grupos de Portais</h2>
    <div>
      <span class="mr-2 text-caption">Selecionados: {{ selection.selected.length }}</span>

      <v-btn
        class="mr-2"
        color="error"
        :disabled="selection.selected.length === 0"
        prepend-icon="mdi-cancel"
        @click="removerSelecionados"
      >
        Desativar Selecionados
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="selectedGroup = {}; dialog = true">
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
    :items="portalGroups"
    :items-length="totalItems ?? 0"
    :items-per-page="pageSize ?? 10"
    :loading="portalGroupStore.loading"
    :page="currentPage ?? 1"
    return-object
    select-strategy="all"
    show-select
    @click:row="showGroupDetails"
    @update:items-per-page="itemsPerPageChanged"
    @update:page="ChangePage"
  >
    <template v-slot:item.description="{ item }">
      {{ item.description || '—' }}
    </template>
    <template v-slot:item.device_count="{ item }">
      <v-chip size="small" color="primary">
        {{ getDeviceCount(item) }}
      </v-chip>
    </template>
    <template v-slot:item.is_active="{ item }">
      <v-chip :color="item.is_active ? 'success' : 'grey'" size="small">
        {{ item.is_active ? 'Ativo' : 'Inativo' }}
      </v-chip>
    </template>
  </v-data-table-server>

  <PortalGroupDialog
    v-model="dialog"
    :portal-group="selectedGroup"
    @save="salvarGrupo"
  />
</template>
