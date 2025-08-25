<template>
  <v-container fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              Horários de Acesso
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              Configure janelas de tempo para controle de acesso
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openDialog()"
          >
            Novo Horário
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          hide-details
          label="Buscar horários..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          clearable
          density="compact"
          hide-details
          :items="statusOptions"
          label="Status"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-btn
          prepend-icon="mdi-filter-variant"
          variant="outlined"
          @click="applyFilters"
        >
          Aplicar Filtros
        </v-btn>
      </v-col>
    </v-row>

    <!-- Time Zones Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-1"
            :headers="headers"
            :items="timeZones"
            :items-per-page="10"
            :items-per-page-options="[5, 10, 25, 50]"
            :loading="loading"
            :search="search"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  class="mr-3"
                  color="primary"
                >
                  mdi-clock
                </v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    ID: {{ item.id }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.description="{ item }">
              <span class="text-body-2">
                {{ item.description || 'Sem descrição' }}
              </span>
            </template>

            <template #item.time_spans="{ item }">
              <div class="d-flex flex-column gap-1">
                <v-chip
                  v-for="span in item.time_spans"
                  :key="span.id"
                  color="primary"
                  size="small"
                  variant="tonal"
                >
                  {{ formatTimeSpan(span) }}
                </v-chip>
                <span
                  v-if="!item.time_spans || item.time_spans.length === 0"
                  class="text-caption text-medium-emphasis"
                >
                  Nenhum período definido
                </span>
              </div>
            </template>

            <template #item.is_active="{ item }">
              <v-switch
                v-model="item.is_active"
                density="compact"
                hide-details
                :loading="item.updating"
                @change="toggleTimeZoneStatus(item)"
              />
            </template>

            <template #item.actions="{ item }">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item @click="openDialog(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-pencil</v-icon>
                      Editar
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewDetails(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-eye</v-icon>
                      Ver Detalhes
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="manageTimeSpans(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-clock-edit</v-icon>
                      Gerenciar Períodos
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteTimeZone(item)">
                    <v-list-item-title class="text-error">
                      <v-icon class="mr-2">mdi-delete</v-icon>
                      Excluir
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Time Zone Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ editingTimeZone ? 'Editar Horário' : 'Novo Horário' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  label="Nome do Horário"
                  required
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  auto-grow
                  label="Descrição"
                  rows="3"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="form.is_active"
                  color="primary"
                  label="Horário Ativo"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="saving"
            @click="saveTimeZone"
          >
            {{ editingTimeZone ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Time Spans Dialog -->
    <v-dialog
      v-model="timeSpansDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Períodos de Horário: {{ selectedTimeZone?.name }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-btn
                class="mb-4"
                color="primary"
                prepend-icon="mdi-plus"
                @click="openTimeSpanDialog()"
              >
                Adicionar Período
              </v-btn>
            </v-col>
          </v-row>

          <v-data-table
            class="elevation-1"
            :headers="timeSpanHeaders"
            :items="selectedTimeZone?.time_spans || []"
            :loading="loadingTimeSpans"
          >
            <template #item.day_of_week="{ item }">
              <v-chip
                :color="getDayColor(item.day_of_week)"
                size="small"
                variant="tonal"
              >
                {{ getDayLabel(item.day_of_week) }}
              </v-chip>
            </template>

            <template #item.start_time="{ item }">
              <span class="font-weight-medium">
                {{ formatTime(item.start_time) }}
              </span>
            </template>

            <template #item.end_time="{ item }">
              <span class="font-weight-medium">
                {{ formatTime(item.end_time) }}
              </span>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="openTimeSpanDialog(item)"
              />
              <v-btn
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="deleteTimeSpan(item)"
              />
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="timeSpansDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Time Span Dialog -->
    <v-dialog
      v-model="timeSpanDialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ editingTimeSpan ? 'Editar Período' : 'Novo Período' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="timeSpanForm" v-model="timeSpanFormValid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="timeSpanForm.day_of_week"
                  :items="dayOptions"
                  label="Dia da Semana"
                  required
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="timeSpanForm.start_time"
                  label="Horário de Início"
                  required
                  :rules="[rules.required]"
                  type="time"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="timeSpanForm.end_time"
                  label="Horário de Fim"
                  required
                  :rules="[rules.required]"
                  type="time"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeTimeSpanDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!timeSpanFormValid"
            :loading="savingTimeSpan"
            @click="saveTimeSpan"
          >
            {{ editingTimeSpan ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog
      v-model="detailsDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Detalhes do Horário: {{ selectedTimeZone?.name }}
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Nome</v-list-item-title>
              <v-list-item-subtitle>{{ selectedTimeZone?.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="selectedTimeZone?.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ selectedTimeZone?.is_active ? 'Ativo' : 'Inativo' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedTimeZone?.description">
              <v-list-item-title>Descrição</v-list-item-title>
              <v-list-item-subtitle>{{ selectedTimeZone.description }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Períodos</v-list-item-title>
              <v-list-item-subtitle>
                <div class="d-flex flex-column gap-1 mt-2">
                  <v-chip
                    v-for="span in selectedTimeZone?.time_spans"
                    :key="span.id"
                    color="primary"
                    size="small"
                    variant="tonal"
                  >
                    {{ formatTimeSpan(span) }}
                  </v-chip>
                </div>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="detailsDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
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
  import type { TimeSpan, TimeZone } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import timeSpansService from '@/services/time_spans'
  import timeZonesService from '@/services/time_zones'

  // Estado reativo
  const loading = ref(false)
  const saving = ref(false)
  const loadingTimeSpans = ref(false)
  const savingTimeSpan = ref(false)
  const dialog = ref(false)
  const timeSpansDialog = ref(false)
  const timeSpanDialog = ref(false)
  const detailsDialog = ref(false)
  const search = ref('')
  const statusFilter = ref('')
  const formValid = ref(false)
  const timeSpanFormValid = ref(false)
  const form = ref<any>({
    name: '',
    description: '',
    is_active: true,
  })
  const timeSpanForm = ref<any>({
    day_of_week: '',
    start_time: '',
    end_time: '',
  })

  const timeZones = ref<TimeZone[]>([])
  const selectedTimeZone = ref<TimeZone | null>(null)
  const editingTimeZone = ref<TimeZone | null>(null)
  const editingTimeSpan = ref<TimeSpan | null>(null)

  // Headers da tabela
  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Descrição', key: 'description', sortable: false },
    { title: 'Períodos', key: 'time_spans', sortable: false },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  const timeSpanHeaders = [
    { title: 'Dia', key: 'day_of_week', sortable: true },
    { title: 'Início', key: 'start_time', sortable: true },
    { title: 'Fim', key: 'end_time', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  // Opções de filtro
  const statusOptions = [
    { title: 'Ativos', value: 'active' },
    { title: 'Inativos', value: 'inactive' },
  ]

  const dayOptions = [
    { title: 'Segunda-feira', value: 1 },
    { title: 'Terça-feira', value: 2 },
    { title: 'Quarta-feira', value: 3 },
    { title: 'Quinta-feira', value: 4 },
    { title: 'Sexta-feira', value: 5 },
    { title: 'Sábado', value: 6 },
    { title: 'Domingo', value: 0 },
  ]

  // Regras de validação
  const rules = {
    required: (v: string) => !!v || 'Campo obrigatório',
  }

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Computed - filtros aplicados automaticamente via v-data-table

  // Métodos
  const loadTimeZones = async () => {
    loading.value = true
    try {
      const response = await timeZonesService.getTimeZones()
      timeZones.value = response.results
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      showSnackbar('Erro ao carregar horários', 'error')
    } finally {
      loading.value = false
    }
  }

  const openDialog = (timeZone?: TimeZone) => {
    editingTimeZone.value = timeZone || null
    form.value = timeZone
      ? {
        name: timeZone.name,
        description: timeZone.description,
        is_active: timeZone.is_active,
      }
      : {
        name: '',
        description: '',
        is_active: true,
      }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
    editingTimeZone.value = null
    form.value = {
      name: '',
      description: '',
      is_active: true,
    }
  }

  const saveTimeZone = async () => {
    if (!formValid.value) return

    saving.value = true
    try {
      if (editingTimeZone.value) {
        await timeZonesService.updateTimeZone(editingTimeZone.value.id, form.value)
        showSnackbar('Horário atualizado com sucesso')
      } else {
        await timeZonesService.createTimeZone(form.value)
        showSnackbar('Horário criado com sucesso')
      }
      closeDialog()
      loadTimeZones()
    } catch (error) {
      console.error('Erro ao salvar horário:', error)
      showSnackbar('Erro ao salvar horário', 'error')
    } finally {
      saving.value = false
    }
  }

  const deleteTimeZone = async (timeZone: TimeZone) => {
    if (!confirm(`Tem certeza que deseja excluir o horário "${timeZone.name}"?`)) return

    try {
      await timeZonesService.deleteTimeZone(timeZone.id)
      showSnackbar('Horário excluído com sucesso')
      loadTimeZones()
    } catch (error) {
      console.error('Erro ao excluir horário:', error)
      showSnackbar('Erro ao excluir horário', 'error')
    }
  }

  const toggleTimeZoneStatus = async (timeZone: TimeZone) => {
    timeZone.updating = true
    try {
      await timeZonesService.updateTimeZone(timeZone.id, { is_active: timeZone.is_active })
      showSnackbar('Status do horário atualizado')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      timeZone.is_active = !timeZone.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', 'error')
    } finally {
      timeZone.updating = false
    }
  }

  const viewDetails = (timeZone: TimeZone) => {
    selectedTimeZone.value = timeZone
    detailsDialog.value = true
  }

  const manageTimeSpans = (timeZone: TimeZone) => {
    selectedTimeZone.value = timeZone
    timeSpansDialog.value = true
  }

  const openTimeSpanDialog = (timeSpan?: TimeSpan) => {
    editingTimeSpan.value = timeSpan || null
    timeSpanForm.value = timeSpan
      ? {
        day_of_week: timeSpan.day_of_week,
        start_time: timeSpan.start_time,
        end_time: timeSpan.end_time,
      }
      : {
        day_of_week: 1,
        start_time: '08:00',
        end_time: '18:00',
      }
    timeSpanDialog.value = true
  }

  const closeTimeSpanDialog = () => {
    timeSpanDialog.value = false
    editingTimeSpan.value = null
    timeSpanForm.value = null
  }

  const saveTimeSpan = async () => {
    if (!timeSpanFormValid.value || !selectedTimeZone.value) return

    savingTimeSpan.value = true
    try {
      if (editingTimeSpan.value) {
        await timeSpansService.updateTimeSpan(editingTimeSpan.value.id, timeSpanForm.value)
        showSnackbar('Período atualizado com sucesso')
      } else {
        await timeSpansService.createTimeSpan({
          ...timeSpanForm.value,
          time_zone: selectedTimeZone.value.id,
        })
        showSnackbar('Período criado com sucesso')
      }
      closeTimeSpanDialog()
      // Recarregar o time zone selecionado
      const response = await timeZonesService.getTimeZone(selectedTimeZone.value.id)
      selectedTimeZone.value = response.data
    } catch (error) {
      console.error('Erro ao salvar período:', error)
      showSnackbar('Erro ao salvar período', 'error')
    } finally {
      savingTimeSpan.value = false
    }
  }

  const deleteTimeSpan = async (timeSpan: TimeSpan) => {
    if (!confirm('Tem certeza que deseja excluir este período?')) return

    try {
      await timeSpansService.deleteTimeSpan(timeSpan.id)
      showSnackbar('Período excluído com sucesso')
      // Recarregar o time zone selecionado
      if (selectedTimeZone.value) {
        const response = await timeZonesService.getTimeZone(selectedTimeZone.value.id)
        selectedTimeZone.value = response.data
      }
    } catch (error) {
      console.error('Erro ao excluir período:', error)
      showSnackbar('Erro ao excluir período', 'error')
    }
  }

  const applyFilters = () => {
  // Os filtros são aplicados automaticamente via computed
  }

  const formatTimeSpan = (timeSpan: TimeSpan) => {
    return `${getDayLabel(timeSpan.day_of_week)} - ${formatTime(timeSpan.start_time)} às ${formatTime(timeSpan.end_time)}`
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove segundos se houver
  }

  const getDayColor = (dayOfWeek: number) => {
    const colors: Record<number, string> = {
      0: 'red', // Domingo
      1: 'blue', // Segunda
      2: 'green', // Terça
      3: 'orange', // Quarta
      4: 'purple', // Quinta
      5: 'teal', // Sexta
      6: 'pink', // Sábado
    }
    return colors[dayOfWeek] || 'grey'
  }

  const getDayLabel = (dayOfWeek: number) => {
    const labels: Record<number, string> = {
      0: 'Dom',
      1: 'Seg',
      2: 'Ter',
      3: 'Qua',
      4: 'Qui',
      5: 'Sex',
      6: 'Sáb',
    }
    return labels[dayOfWeek] || 'Desconhecido'
  }

  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadTimeZones()
  })
</script>
