<script lang="ts" setup>
  import type { Portal } from '@/types'
  import { computed, ref, watch } from 'vue'
  import { toast } from 'vue3-toastify'
  import { usePortalStore } from '@/stores/portal'
  import PortalDialog from './PortalDialog.vue'

  defineProps<{
    portals: Portal[]
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
  }>()

  defineEmits<{
    (e: 'page-changed' | 'item-per-page', value: number): void
  }>()

  const portalStore = usePortalStore()
  const dialog = ref(false)
  const selectedPortal = ref<Portal | null>(null)
  const selection = ref({ selected: [] as Portal[] })

  const rules = computed(() => portalStore.portals)

  const headers = [
    { title: 'ID', key: 'id', align: 'start' as const },
    { title: 'Nome', key: 'name', align: 'start' as const },
    { title: 'Área de Origem', key: 'area_from', align: 'start' as const },
    { title: 'Área de Destino', key: 'area_to', align: 'start' as const },
  ]

  watch(() => selection.value.selected, newSelection => {
    console.log('Seleção atualizada:', {
      selecionados: newSelection,
      quantidade: newSelection.length,
      ids: newSelection.map(item => item.id),
    })
  }, { deep: true })

  function onSelectionChanged (items: (Portal | number)[]) {
    const selectedPortals = Array.isArray(items)
      ? items.map(item => {
        if (typeof item === 'number') {
          const portal = rules.value.find(r => r.id === item)
          return portal
        }
        return item
      }).filter((portal): portal is Portal => portal !== undefined)
      : []

    selection.value.selected = selectedPortals
  }

  function novo () {
    selectedPortal.value = {
      id: 0,
      name: '',
      area_from: { id: 0, name: '' },
      area_to: { id: 0, name: '' },
    }
    dialog.value = true
  }

  function showPortalDetails (event: Event, { item }: { item: Portal }) {
    selectedPortal.value = item
    dialog.value = true
  }

  async function salvar (portal: Portal) {
    try {
      const portalData = {
        name: portal.name,
        area_from: typeof portal.area_from === 'number' ? portal.area_from : portal.area_from.id,
        area_to: typeof portal.area_to === 'number' ? portal.area_to : portal.area_to.id,
      } as unknown as Partial<Portal>

      portal.id === 0
        ? await portalStore.createPortal(portalData)
        : await portalStore.updatePortal(portal.id, portalData)

      await portalStore.loadPortals()
      toast.success('Entrada/Saída salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar entrada/saída:', error)
      toast.error('Erro ao salvar entrada/saída')
    }
  }

  async function removerSelecionados () {
    const selectedItems = selection.value.selected
    if (selectedItems.length === 0) return

    if (confirm(`Remover ${selectedItems.length} entrada(s)/saída(s)?`)) {
      try {
        const validPortals = selectedItems.filter(portal => typeof portal.id === 'number' && !Number.isNaN(portal.id))
        if (validPortals.length === 0) {
          throw new Error('Nenhuma entrada/saída válida para remover')
        }

        await Promise.all(validPortals.map(portal => portalStore.deletePortal(portal.id)))
        await portalStore.loadPortals()
        selection.value.selected = []
        toast.success('Entrada(s)/Saída(s) removida(s) com sucesso!')
      } catch (error) {
        console.error('Erro ao remover entradas/saídas:', error)
        toast.error('Erro ao remover entradas/saídas')
      }
    }
  }
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">Gerenciar Entradas e Saídas</h2>

    <div>
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
        @click="novo"
      >
        Adicionar Entrada/Saída
      </v-btn>
    </div>
  </div>

  <v-data-table
    v-model="selection.selected"
    class="rounded-lg"
    :headers="headers"
    hover
    item-value="id"
    :items="portals"
    show-select
    @click:row="showPortalDetails"
    @update:model-value="onSelectionChanged"
  >
    <template #item.area_from="{ item }">
      {{ typeof item.area_from === 'object' ? item.area_from.name : 'N/A' }}
    </template>

    <template #item.area_to="{ item }">
      {{ typeof item.area_to === 'object' ? item.area_to.name : 'N/A' }}
    </template>
  </v-data-table>

  <PortalDialog v-model="dialog" :portal="selectedPortal" @save="salvar" />
</template>

<style scoped>
.v-data-table >>> tbody tr {
  cursor: pointer;
}
</style>
