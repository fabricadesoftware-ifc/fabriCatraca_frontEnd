<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Áreas</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openDialog()"
          >
            Nova Área
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          label="Buscar áreas"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="secondary"
          :loading="loading"
          variant="outlined"
          @click="loadAreas"
        >
          Filtrar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela de Áreas -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-0"
            :headers="headers"
            :items="areas"
            :items-per-page="10"
            :items-per-page-options="[10, 25, 50, 100]"
            :loading="loading"
            :search="search"
          >
            <template #item.actions="{ item }">
              <v-btn
                class="mr-2"
                color="info"
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewArea(item)"
              />
              <v-btn
                class="mr-2"
                color="warning"
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editArea(item)"
              />
              <v-btn
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="deleteArea(item)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Área -->
    <v-dialog
      v-model="dialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Editar' : 'Nova' }} Área</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedArea.name"
              density="compact"
              label="Nome da Área"
              :rules="[rules.required]"
              variant="outlined"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid"
            :loading="saving"
            @click="saveArea"
          >
            {{ isEditing ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação de Exclusão -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir a área <strong>{{ areaToDelete?.name }}</strong>?
          Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type { Area } from '@/types'
  import { onMounted, ref } from 'vue'
  import { AreasService } from '@/services'

  // Estado reativo
  const areas = ref<Area[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const dialog = ref(false)
  const deleteDialog = ref(false)
  const valid = ref(false)
  const search = ref('')

  const isEditing = ref(false)
  const editedArea = ref<Partial<Area>>({})
  const areaToDelete = ref<Area | null>(null)

  // Headers da tabela
  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, width: '150px' },
  ]

  // Regras de validação
  const rules = {
    required: (v: any) => !!v || 'Campo obrigatório',
  }

  // Métodos
  const loadAreas = async () => {
    loading.value = true
    try {
      const response = await AreasService.getAreas()
      areas.value = response.results
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
    } finally {
      loading.value = false
    }
  }

  const openDialog = (area?: Area) => {
    isEditing.value = !!area
    editedArea.value = area
      ? {
        id: area.id,
        name: area.name,
      }
      : {
        name: '',
      }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
    editedArea.value = {}
    isEditing.value = false
  }

  const saveArea = async () => {
    if (!valid.value) return

    saving.value = true
    try {
      await (isEditing.value && editedArea.value.id ? AreasService.updateArea(editedArea.value.id, editedArea.value) : AreasService.createArea(editedArea.value))

      closeDialog()
      loadAreas()
    } catch (error) {
      console.error('Erro ao salvar área:', error)
    } finally {
      saving.value = false
    }
  }

  const viewArea = (area: Area) => {
    // TODO: Implementar visualização detalhada
    console.log('Visualizar área:', area)
  }

  const editArea = (area: Area) => {
    openDialog(area)
  }

  const deleteArea = (area: Area) => {
    areaToDelete.value = area
    deleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (!areaToDelete.value) return

    deleting.value = true
    try {
      await AreasService.deleteArea(areaToDelete.value.id)
      deleteDialog.value = false
      areaToDelete.value = null
      loadAreas()
    } catch (error) {
      console.error('Erro ao excluir área:', error)
    } finally {
      deleting.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    loadAreas()
  })
</script>
