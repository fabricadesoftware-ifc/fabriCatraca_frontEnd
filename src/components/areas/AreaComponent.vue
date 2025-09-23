<script setup lang="ts">
import { useAreaStore } from '@/stores';
import type { Area } from '@/types'
import { ref } from 'vue';
const selectedArea = ref({})
const dialog = ref(false)

defineProps<{
  areas: Area[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
}>()

const emit = defineEmits<{
  (e: 'page-changed', value: number): void
  (e: 'item-per-page', value: number): void
}>()

const areaStore = useAreaStore()

const headers = [
  { title: 'ID', key: 'id', align: 'start' as const },
  { title: 'Nome', key: 'name', align: 'start' as const },
]

const selection = ref({
  selected: [] as Area[],
})

async function atualizarArea(area) {
  if ('id' in area) {
    await areaStore.updateArea(area.id, area)
  }
  else {
    await areaStore.createArea(area)
  }
}

async function removerSelecionados() {
  const selectedItems = selection.value.selected
  if (selectedItems.length === 0) return

  if (confirm(`Remover ${selectedItems.length} area(s)?`)) {
    try {
      // Filtrar apenas grupos com ID válido
      const validAreas = selectedItems.filter(group => typeof group.id === 'number' && !Number.isNaN(group.id))
      if (validAreas.length === 0) {
        throw new Error('Nenhum grupo válido para remover')
      }

      // Deletar cada grupo selecionado
      await Promise.all(validAreas.map(area => areaStore.deleteArea(area.id)))
      // Recarregar a lista após deletar
      await areaStore.loadAreas()

      // Limpar seleção
      selection.value.selected = []
    } catch (error) {
      console.error('Erro ao remover grupos:', error)
      alert('Erro ao remover grupos. Por favor, tente novamente.')
    }
  }
}

function showAreaDetails(event: Event, { item }: { item: Area }) {
  selectedArea.value = item
  dialog.value = true
}

function ChangePage (page: number) {
    emit('page-changed', page)
  }

function itemsPerPageChanged (newPageSize: number) {
    emit('item-per-page', newPageSize)
}

</script>
<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5">Gerenciar Areas</h2>
    <div>
      <span class="mr-2 text-caption">Selecionados: {{ selection.selected.length }}</span>

      <v-btn :disabled="selection.selected.length === 0" class="mr-2" color="error" @click="removerSelecionados"
        prepend-icon="mdi-delete">
        Remover Selecionados
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="dialog = true">

        Adicionar Area
      </v-btn>
    </div>
  </div>
  <VDataTableServer v-model="selection.selected" class="rounded-lg" hover item-key="id" :items="areas"
    :headers="headers" :items-length="totalItems ?? 0" :items-per-page="pageSize ?? 10" :loading="areas.length === 0"
    :page="currentPage ?? 1" return-object select-strategy="all" show-select @click:row="showAreaDetails"
    @update:items-per-page="itemsPerPageChanged" @update:page="ChangePage" @update:selected="onSelect" />
  <AreaDialog v-model="dialog" :area="selectedArea" @save="atualizarArea" />
  <!-- <p> v-model="selection.selected"
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
    @update:selected="onSelect"</p> -->
</template>
