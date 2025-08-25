<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Áreas</h1>
        </div>
      </v-col>
    </v-row>

    <AreaList
      :areas="areas"
      :loading="loading"
      @add="openAreaDialog()"
      @delete="deleteArea"
      @edit="editArea"
      @view="viewArea"
    />

    <AreaForm
      v-model="areaDialog"
      :area="editingArea"
      :saving="saving"
      @save="saveArea"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { Area } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import AreaForm from '@/components/areas/AreaForm.vue'
  import AreaList from '@/components/areas/AreaList.vue'
  import { useArea } from '@/composables/useArea'

  // Componentes

  // Composables
  const {
    areas,
    loading,
    saving,
    loadAreas,
    createArea,
    updateArea,
    deleteArea: removeArea,
  } = useArea()

  // Estado local
  const areaDialog = ref(false)
  const editingArea = ref<Area | undefined>()

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos
  const openAreaDialog = (area?: Area) => {
    editingArea.value = area
    areaDialog.value = true
  }

  const editArea = (area: Area) => {
    openAreaDialog(area)
  }

  const viewArea = (area: Area) => {
    // TODO: Implementar visualização detalhada
    console.log('Visualizar área:', area)
  }

  const saveArea = async (data: Partial<Area>) => {
    try {
      if (editingArea.value) {
        await updateArea(editingArea.value.id, data)
        showSnackbar('Área atualizada com sucesso')
      } else {
        await createArea(data)
        showSnackbar('Área criada com sucesso')
      }
      areaDialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar área', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deleteArea = async (area: Area) => {
    if (!confirm(`Tem certeza que deseja excluir a área "${area.name}"?`)) return

    try {
      await removeArea(area.id)
      showSnackbar('Área excluída com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir área', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  // Helpers
  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadAreas()
  })
</script>
