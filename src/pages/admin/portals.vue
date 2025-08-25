<template>
  <v-container fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              Portais de Acesso
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              Gerencie pontos de entrada e saída do sistema
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openDialog()"
          >
            Novo Portal
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
          label="Buscar portais..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="areaFilter"
          clearable
          density="compact"
          hide-details
          item-title="name"
          item-value="id"
          :items="areas"
          label="Área"
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

    <!-- Portals Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-1"
            :headers="headers"
            :items="portals"
            :items-per-page="10"
            :items-per-page-options="[5, 10, 25, 50]"
            :loading="loading"
            :search="search"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  class="mr-3"
                  :color="getPortalTypeColor(item.type)"
                >
                  {{ getPortalTypeIcon(item.type) }}
                </v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getPortalTypeLabel(item.type) }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.description="{ item }">
              <span class="text-body-2">
                {{ item.description || 'Sem descrição' }}
              </span>
            </template>

            <template #item.area="{ item }">
              <v-chip
                v-if="item.area"
                :color="getAreaColor(item.area.id)"
                size="small"
                variant="tonal"
              >
                {{ item.area.name }}
              </v-chip>
              <span
                v-else
                class="text-caption text-medium-emphasis"
              >
                Sem área definida
              </span>
            </template>

            <template #item.devices="{ item }">
              <div class="d-flex flex-column gap-1">
                <v-chip
                  v-for="device in item.devices"
                  :key="device.id"
                  :color="getDeviceStatusColor(device.status)"
                  size="small"
                  variant="tonal"
                >
                  {{ device.name }}
                </v-chip>
                <span
                  v-if="!item.devices || item.devices.length === 0"
                  class="text-caption text-medium-emphasis"
                >
                  Nenhum dispositivo
                </span>
              </div>
            </template>

            <template #item.is_active="{ item }">
              <v-switch
                v-model="item.is_active"
                density="compact"
                hide-details
                :loading="item.updating"
                @change="togglePortalStatus(item)"
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
                  <v-list-item @click="manageDevices(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-devices</v-icon>
                      Gerenciar Dispositivos
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="manageAccessRules(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-shield-account</v-icon>
                      Regras de Acesso
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deletePortal(item)">
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

    <!-- Portal Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="700px"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ editingPortal ? 'Editar Portal' : 'Novo Portal' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Nome do Portal"
                  required
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.type"
                  :items="portalTypeOptions"
                  label="Tipo de Portal"
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
                  v-model="form.area"
                  clearable
                  item-title="name"
                  item-value="id"
                  :items="areas"
                  label="Área"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.is_active"
                  color="primary"
                  label="Portal Ativo"
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
            @click="savePortal"
          >
            {{ editingPortal ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Devices Dialog -->
    <v-dialog
      v-model="devicesDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Dispositivos do Portal: {{ selectedPortal?.name }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-btn
                class="mb-4"
                color="primary"
                prepend-icon="mdi-plus"
                @click="openDeviceDialog()"
              >
                Adicionar Dispositivo
              </v-btn>
            </v-col>
          </v-row>

          <v-data-table
            class="elevation-1"
            :headers="deviceHeaders"
            :items="selectedPortal?.devices || []"
            :loading="loadingDevices"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  class="mr-3"
                  :color="getDeviceStatusColor(item.status)"
                >
                  mdi-door-open
                </v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.ip_address }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.status="{ item }">
              <v-chip
                :color="getDeviceStatusColor(item.status)"
                size="small"
                variant="tonal"
              >
                {{ getDeviceStatusLabel(item.status) }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="removeDevice(item)"
              />
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="devicesDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Device Selection Dialog -->
    <v-dialog
      v-model="deviceDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Adicionar Dispositivo ao Portal
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="selectedDevice"
            item-title="name"
            item-value="id"
            :items="availableDevices"
            label="Selecionar Dispositivo"
            :loading="loadingAvailableDevices"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="deviceDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!selectedDevice"
            @click="addDevice"
          >
            Adicionar
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
          Detalhes do Portal: {{ selectedPortal?.name }}
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Nome</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPortal?.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tipo</v-list-item-title>
              <v-list-item-subtitle>{{ getPortalTypeLabel(selectedPortal?.type) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="selectedPortal?.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ selectedPortal?.is_active ? 'Ativo' : 'Inativo' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedPortal?.description">
              <v-list-item-title>Descrição</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPortal.description }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedPortal?.area">
              <v-list-item-title>Área</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPortal.area.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Dispositivos</v-list-item-title>
              <v-list-item-subtitle>
                <div class="d-flex flex-column gap-1 mt-2">
                  <v-chip
                    v-for="device in selectedPortal?.devices"
                    :key="device.id"
                    :color="getDeviceStatusColor(device.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ device.name }}
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
  import type { Area, Device, Portal } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import areasService from '@/services/areas'
  import devicesService from '@/services/device'
  import portalsService from '@/services/portals'

  // Estado reativo
  const loading = ref(false)
  const saving = ref(false)
  const loadingDevices = ref(false)
  const loadingAvailableDevices = ref(false)
  const dialog = ref(false)
  const devicesDialog = ref(false)
  const deviceDialog = ref(false)
  const detailsDialog = ref(false)
  const search = ref('')
  const areaFilter = ref('')
  const statusFilter = ref('')
  const formValid = ref(false)
  const form = ref<any>({
    name: '',
    description: '',
    area_from: null,
    area_to: null,
    is_active: true,
  })
  const selectedDevice = ref<number | null>(null)

  const portals = ref<Portal[]>([])
  const areas = ref<Area[]>([])
  const availableDevices = ref<Device[]>([])
  const selectedPortal = ref<Portal | null>(null)
  const editingPortal = ref<Portal | null>(null)

  // Headers da tabela
  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Descrição', key: 'description', sortable: false },
    { title: 'Área', key: 'area', sortable: true },
    { title: 'Dispositivos', key: 'devices', sortable: false },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  const deviceHeaders = [
    { title: 'Dispositivo', key: 'name', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  // Opções de filtro
  const statusOptions = [
    { title: 'Ativos', value: 'active' },
    { title: 'Inativos', value: 'inactive' },
  ]

  const portalTypeOptions = [
    { title: 'Entrada', value: 'entrance' },
    { title: 'Saída', value: 'exit' },
    { title: 'Entrada/Saída', value: 'both' },
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
  const loadPortals = async () => {
    loading.value = true
    try {
      const response = await portalsService.getPortals()
      portals.value = response.results
    } catch (error) {
      console.error('Erro ao carregar portais:', error)
      showSnackbar('Erro ao carregar portais', 'error')
    } finally {
      loading.value = false
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

  const loadAvailableDevices = async () => {
    loadingAvailableDevices.value = true
    try {
      const response = await devicesService.getDevices()
      availableDevices.value = response.results
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    } finally {
      loadingAvailableDevices.value = false
    }
  }

  const openDialog = (portal?: Portal) => {
    editingPortal.value = portal || null
    form.value = portal
      ? {
        id: portal.id,
        name: portal.name,
        description: portal.description || '',
        area_from: portal.area_from?.id || null,
        area_to: portal.area_to?.id || null,
        portal_type: portal.portal_type || 'entrance',
        is_active: portal.is_active,
        devices: portal.devices?.map(d => d.id) || [],
      }
      : {
        name: '',
        description: '',
        area_from: null,
        area_to: null,
        portal_type: 'entrance',
        is_active: true,
        devices: [],
      }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
    editingPortal.value = null
    form.value = {
      name: '',
      description: '',
      area_from: null,
      area_to: null,
      is_active: true,
    }
  }

  const savePortal = async () => {
    if (!formValid.value) return

    saving.value = true
    try {
      if (editingPortal.value) {
        await portalsService.updatePortal(editingPortal.value.id, form.value)
        showSnackbar('Portal atualizado com sucesso')
      } else {
        await portalsService.createPortal(form.value)
        showSnackbar('Portal criado com sucesso')
      }
      closeDialog()
      loadPortals()
    } catch (error) {
      console.error('Erro ao salvar portal:', error)
      showSnackbar('Erro ao salvar portal', 'error')
    } finally {
      saving.value = false
    }
  }

  const deletePortal = async (portal: Portal) => {
    if (!confirm(`Tem certeza que deseja excluir o portal "${portal.name}"?`)) return

    try {
      await portalsService.deletePortal(portal.id)
      showSnackbar('Portal excluído com sucesso')
      loadPortals()
    } catch (error) {
      console.error('Erro ao excluir portal:', error)
      showSnackbar('Erro ao excluir portal', 'error')
    }
  }

  const togglePortalStatus = async (portal: Portal) => {
    portal.updating = true
    try {
      await portalsService.updatePortal(portal.id, { is_active: portal.is_active })
      showSnackbar('Status do portal atualizado')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      portal.is_active = !portal.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', 'error')
    } finally {
      portal.updating = false
    }
  }

  const viewDetails = (portal: Portal) => {
    selectedPortal.value = portal
    detailsDialog.value = true
  }

  const manageDevices = (portal: Portal) => {
    selectedPortal.value = portal
    devicesDialog.value = true
  }

  const manageAccessRules = (_portal: Portal) => {
    // TODO: Implementar gerenciamento de regras de acesso
    showSnackbar('Funcionalidade em desenvolvimento', 'info')
  }

  const openDeviceDialog = async () => {
    await loadAvailableDevices()
    selectedDevice.value = null
    deviceDialog.value = true
  }

  const addDevice = async () => {
    if (!selectedDevice.value || !selectedPortal.value) return

    try {
      // TODO: Implementar adição de dispositivo ao portal
      showSnackbar('Dispositivo adicionado ao portal')
      deviceDialog.value = false
      // Recarregar portal
      const response = await portalsService.getPortal(selectedPortal.value.id)
      selectedPortal.value = response.data
    } catch (error) {
      console.error('Erro ao adicionar dispositivo:', error)
      showSnackbar('Erro ao adicionar dispositivo', 'error')
    }
  }

  const removeDevice = async (device: Device) => {
    if (!selectedPortal.value) return

    if (!confirm(`Tem certeza que deseja remover o dispositivo "${device.name}"?`)) return

    try {
      // TODO: Implementar remoção de dispositivo do portal
      showSnackbar('Dispositivo removido do portal')
      // Recarregar portal
      const response = await portalsService.getPortal(selectedPortal.value.id)
      selectedPortal.value = response.data
    } catch (error) {
      console.error('Erro ao remover dispositivo:', error)
      showSnackbar('Erro ao remover dispositivo', 'error')
    }
  }

  const applyFilters = () => {
  // Os filtros são aplicados automaticamente via computed
  }

  const getPortalTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      entrance: 'success',
      exit: 'error',
      both: 'primary',
    }
    return colors[type] || 'grey'
  }

  const getPortalTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      entrance: 'mdi-login',
      exit: 'mdi-logout',
      both: 'mdi-swap-horizontal',
    }
    return icons[type] || 'mdi-door'
  }

  const getPortalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrance: 'Entrada',
      exit: 'Saída',
      both: 'Entrada/Saída',
    }
    return labels[type] || 'Desconhecido'
  }

  const getAreaColor = (areaId: number) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info']
    return colors[areaId % colors.length]
  }

  const getDeviceStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: 'success',
      offline: 'error',
      warning: 'warning',
      maintenance: 'info',
    }
    return colors[status] || 'grey'
  }

  const getDeviceStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      online: 'Online',
      offline: 'Offline',
      warning: 'Aviso',
      maintenance: 'Manutenção',
    }
    return labels[status] || 'Desconhecido'
  }

  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadPortals()
    loadAreas()
  })
</script>
