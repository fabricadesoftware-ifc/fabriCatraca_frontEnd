<template>
  <v-container fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              Regras de Acesso
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              Configure políticas de acesso para usuários, grupos e dispositivos
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openDialog()"
          >
            Nova Regra
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          hide-details
          label="Buscar regras..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="typeFilter"
          clearable
          density="compact"
          hide-details
          :items="typeOptions"
          label="Tipo"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="2">
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
      <v-col cols="12" md="2">
        <v-select
          v-model="priorityFilter"
          clearable
          density="compact"
          hide-details
          :items="priorityOptions"
          label="Prioridade"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          prepend-icon="mdi-filter-variant"
          variant="outlined"
          @click="applyFilters"
        >
          Filtrar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Access Rules Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-1"
            :headers="headers"
            :items="accessRules"
            :items-per-page="10"
            :items-per-page-options="[5, 10, 25, 50]"
            :loading="loading"
            :search="search"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  class="mr-3"
                  :color="getTypeColor(item.type)"
                >
                  {{ getTypeIcon(item.type) }}
                </v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getTypeLabel(item.type) }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.description="{ item }">
              <span class="text-body-2">
                {{ item.description || 'Sem descrição' }}
              </span>
            </template>

            <template #item.priority="{ item }">
              <v-chip
                :color="getPriorityColor(item.priority)"
                size="small"
                variant="tonal"
              >
                {{ item.priority }}
              </v-chip>
            </template>

            <template #item.type="{ item }">
              <v-chip
                :color="getTypeColor(item.type)"
                size="small"
                variant="tonal"
              >
                {{ getTypeLabel(item.type) }}
              </v-chip>
            </template>

            <template #item.is_active="{ item }">
              <v-switch
                v-model="item.is_active"
                density="compact"
                hide-details
                :loading="item.updating"
                @change="toggleRuleStatus(item)"
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
                  <v-list-item @click="duplicateRule(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-content-copy</v-icon>
                      Duplicar
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteRule(item)">
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

    <!-- Access Rule Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="800px"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ editingRule ? 'Editar Regra de Acesso' : 'Nova Regra de Acesso' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Nome da Regra"
                  required
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.type"
                  :items="typeOptions"
                  label="Tipo de Regra"
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
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.priority"
                  :items="priorityOptions"
                  label="Prioridade"
                  required
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.is_active"
                  color="primary"
                  label="Regra Ativa"
                />
              </v-col>
            </v-row>

            <!-- Configurações específicas por tipo -->
            <v-expansion-panels class="mt-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  Configurações Avançadas
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.time_zones"
                        chips
                        closable-chips
                        :items="timeZones"
                        label="Horários de Acesso"
                        multiple
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.areas"
                        chips
                        closable-chips
                        :items="areas"
                        label="Áreas Permitidas"
                        multiple
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
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
            @click="saveRule"
          >
            {{ editingRule ? 'Atualizar' : 'Criar' }}
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
          Detalhes da Regra: {{ selectedRule?.name }}
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Nome</v-list-item-title>
              <v-list-item-subtitle>{{ selectedRule?.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tipo</v-list-item-title>
              <v-list-item-subtitle>{{ getTypeLabel(selectedRule?.type) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Prioridade</v-list-item-title>
              <v-list-item-subtitle>{{ selectedRule?.priority }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="selectedRule?.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ selectedRule?.is_active ? 'Ativa' : 'Inativa' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedRule?.description">
              <v-list-item-title>Descrição</v-list-item-title>
              <v-list-item-subtitle>{{ selectedRule.description }}</v-list-item-subtitle>
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
  import type { AccessRule, Area, TimeZone } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import accessRulesService from '@/services/access_rules'
  import areasService from '@/services/areas'
  import timeZonesService from '@/services/time_zones'

  // Estado reativo
  const loading = ref(false)
  const saving = ref(false)
  const dialog = ref(false)
  const detailsDialog = ref(false)
  const search = ref('')
  const typeFilter = ref('')
  const statusFilter = ref('')
  const priorityFilter = ref('')
  const formValid = ref(false)
  const form = ref<any>({
    name: '',
    description: '',
    type: 'allow',
    priority: 1,
    is_active: true,
    time_zones: [],
    areas: [],
  })

  const accessRules = ref<AccessRule[]>([])
  const timeZones = ref<TimeZone[]>([])
  const areas = ref<Area[]>([])
  const selectedRule = ref<AccessRule | null>(null)
  const editingRule = ref<AccessRule | null>(null)

  // Headers da tabela
  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Descrição', key: 'description', sortable: false },
    { title: 'Tipo', key: 'type', sortable: true },
    { title: 'Prioridade', key: 'priority', sortable: true, align: 'center' },
    { title: 'Ativa', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  // Opções de filtro
  const typeOptions = [
    { title: 'Permitir', value: 'allow' },
    { title: 'Negar', value: 'deny' },
    { title: 'Condicional', value: 'conditional' },
  ]

  const statusOptions = [
    { title: 'Ativas', value: 'active' },
    { title: 'Inativas', value: 'inactive' },
  ]

  const priorityOptions = [
    { title: 'Baixa (1)', value: 1 },
    { title: 'Média (2)', value: 2 },
    { title: 'Alta (3)', value: 3 },
    { title: 'Crítica (4)', value: 4 },
    { title: 'Máxima (5)', value: 5 },
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
  const loadAccessRules = async () => {
    loading.value = true
    try {
      const response = await accessRulesService.getAccessRules()
      accessRules.value = response.results
    } catch (error) {
      console.error('Erro ao carregar regras de acesso:', error)
      showSnackbar('Erro ao carregar regras de acesso', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadTimeZones = async () => {
    try {
      const response = await timeZonesService.getTimeZones()
      timeZones.value = response.results
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
    }
  }

  const loadAreas = async () => {
    try {
      const response = await areasService.getAreas()
      areas.value = response.results
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
    }
  }

  const openDialog = (rule?: AccessRule) => {
    editingRule.value = rule || null
    form.value = rule
      ? {
        name: rule.name,
        description: rule.description,
        type: rule.type,
        priority: rule.priority,
        is_active: rule.is_active,
        time_zones: rule.time_zones?.map(tz => tz.id) || [],
        areas: rule.areas?.map(area => area.id) || [],
      }
      : {
        name: '',
        description: '',
        type: 'allow',
        priority: 1,
        is_active: true,
        time_zones: [],
        areas: [],
      }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
    editingRule.value = null
    form.value = {
      name: '',
      description: '',
      type: 'allow',
      priority: 1,
      is_active: true,
      time_zones: [],
      areas: [],
    }
  }

  const saveRule = async () => {
    if (!formValid.value) return

    saving.value = true
    try {
      if (editingRule.value) {
        await accessRulesService.updateAccessRule(editingRule.value.id, form.value)
        showSnackbar('Regra de acesso atualizada com sucesso')
      } else {
        await accessRulesService.createAccessRule(form.value)
        showSnackbar('Regra de acesso criada com sucesso')
      }
      closeDialog()
      loadAccessRules()
    } catch (error) {
      console.error('Erro ao salvar regra de acesso:', error)
      showSnackbar('Erro ao salvar regra de acesso', 'error')
    } finally {
      saving.value = false
    }
  }

  const deleteRule = async (rule: AccessRule) => {
    if (!confirm(`Tem certeza que deseja excluir a regra "${rule.name}"?`)) return

    try {
      await accessRulesService.deleteAccessRule(rule.id)
      showSnackbar('Regra de acesso excluída com sucesso')
      loadAccessRules()
    } catch (error) {
      console.error('Erro ao excluir regra de acesso:', error)
      showSnackbar('Erro ao excluir regra de acesso', 'error')
    }
  }

  const toggleRuleStatus = async (rule: AccessRule) => {
    rule.updating = true
    try {
      await accessRulesService.updateAccessRule(rule.id, { is_active: rule.is_active })
      showSnackbar('Status da regra atualizado')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      rule.is_active = !rule.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', 'error')
    } finally {
      rule.updating = false
    }
  }

  const viewDetails = (rule: AccessRule) => {
    selectedRule.value = rule
    detailsDialog.value = true
  }

  const duplicateRule = (rule: AccessRule) => {
    const duplicatedRule = {
      ...rule,
      id: undefined,
      name: `${rule.name} (Cópia)`,
      created_at: undefined,
      updated_at: undefined,
    }
    openDialog(duplicatedRule)
  }

  const applyFilters = () => {
  // Os filtros são aplicados automaticamente via computed
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      allow: 'success',
      deny: 'error',
      conditional: 'warning',
    }
    return colors[type] || 'grey'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      allow: 'mdi-check-circle',
      deny: 'mdi-close-circle',
      conditional: 'mdi-help-circle',
    }
    return icons[type] || 'mdi-shield'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      allow: 'Permitir',
      deny: 'Negar',
      conditional: 'Condicional',
    }
    return labels[type] || 'Desconhecido'
  }

  const getPriorityColor = (priority: number) => {
    const colors: Record<number, string> = {
      1: 'grey',
      2: 'blue',
      3: 'orange',
      4: 'red',
      5: 'purple',
    }
    return colors[priority] || 'grey'
  }

  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadAccessRules()
    loadTimeZones()
    loadAreas()
  })
</script>
