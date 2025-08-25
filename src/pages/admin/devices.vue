<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Catracas</h1>
          <div>
            <v-btn
              class="mr-2"
              color="secondary"
              :loading="syncing"
              prepend-icon="mdi-sync"
              variant="outlined"
              @click="syncDevices"
            >
              Sincronizar
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openDialog()"
            >
              Nova Catraca
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Cards de Status -->
    <v-row class="mb-6">
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="success" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-check-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.online }}</div>
              <div class="text-subtitle-1">Online</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="error" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-close-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.offline }}</div>
              <div class="text-subtitle-1">Offline</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="warning" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-alert-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.warning }}</div>
              <div class="text-subtitle-1">Com Problemas</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="info" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-clock</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
              <div class="text-subtitle-1">Total</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          label="Buscar catracas"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          clearable
          density="compact"
          :items="statusOptions"
          label="Status"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="areaFilter"
          clearable
          density="compact"
          item-title="name"
          item-value="id"
          :items="areas"
          label="Área"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="secondary"
          :loading="loading"
          variant="outlined"
          @click="loadDevices"
        >
          Filtrar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela de Dispositivos -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-0"
            :headers="headers"
            :items="devices"
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
                @click="viewDevice(item)"
              />
              <v-btn
                class="mr-2"
                color="warning"
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editDevice(item)"
              />
              <v-btn
                class="mr-2"
                color="success"
                icon="mdi-wifi"
                size="small"
                variant="text"
                @click="testConnection(item)"
              />
              <v-btn
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="deleteDevice(item)"
              />
            </template>

            <template #item.is_active="{ item }">
              <v-chip
                :color="item.is_active ? 'success' : 'error'"
                size="small"
              >
                {{ item.is_active ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </template>

            <template #item.is_default="{ item }">
              <v-chip
                :color="item.is_default ? 'primary' : 'grey'"
                size="small"
                variant="outlined"
              >
                {{ item.is_default ? 'Padrão' : 'Secundário' }}
              </v-chip>
            </template>

            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item)"
                size="small"
              >
                {{ getStatusLabel(item) }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Dispositivo -->
    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Editar' : 'Nova' }} Catraca</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedDevice.name"
                  density="compact"
                  label="Nome da Catraca"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedDevice.ip"
                  density="compact"
                  label="Endereço IP"
                  :rules="[rules.required, rules.ip]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedDevice.username"
                  density="compact"
                  label="Usuário"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="editedDevice.is_active"
                  color="success"
                  label="Ativo"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="editedDevice.is_default"
                  color="primary"
                  label="Dispositivo Padrão"
                />
              </v-col>
            </v-row>
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
            @click="saveDevice"
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
          Tem certeza que deseja excluir a catraca <strong>{{ deviceToDelete?.name }}</strong>?
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
  import type { Area, Device } from '@/types'
  import { onMounted, ref } from 'vue'
  import { AreasService, DeviceService } from '@/services'

  // Estado reativo
  const devices = ref<Device[]>([])
  const areas = ref<Area[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const syncing = ref(false)
  const dialog = ref(false)
  const deleteDialog = ref(false)
  const valid = ref(false)
  const search = ref('')
  const statusFilter = ref(null)
  const areaFilter = ref(null)

  const isEditing = ref(false)
  const editedDevice = ref<Partial<Device>>({})
  const deviceToDelete = ref<Device | null>(null)

  // Headers da tabela
  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'IP', key: 'ip', sortable: true },
    { title: 'Usuário', key: 'username', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Ativo', key: 'is_active', sortable: true },
    { title: 'Padrão', key: 'is_default', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, width: '200px' },
  ]

  // Opções de filtro
  const statusOptions = [
    { title: 'Online', value: 'online' },
    { title: 'Offline', value: 'offline' },
    { title: 'Com Problemas', value: 'warning' },
  ]

  // Estatísticas
  const stats = ref({
    online: 0,
    offline: 0,
    warning: 0,
    total: 0,
  })

  // Regras de validação
  const rules = {
    required: (v: any) => !!v || 'Campo obrigatório',
    ip: (v: any) => {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      return ipRegex.test(v) || 'Endereço IP inválido'
    },
  }

  // Métodos
  const loadDevices = async () => {
    loading.value = true
    try {
      const response = await DeviceService.getDevices()
      devices.value = response.results
      updateStats()
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    } finally {
      loading.value = false
    }
  }

  const loadAreas = async () => {
    try {
      const response = await AreasService.getAreas()
      areas.value = response.results
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
    }
  }

  const syncDevices = async () => {
    syncing.value = true
    try {
      // TODO: Implementar sincronização com catracas
      console.log('Sincronizando dispositivos...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulação
      loadDevices()
    } catch (error) {
      console.error('Erro ao sincronizar dispositivos:', error)
    } finally {
      syncing.value = false
    }
  }

  const updateStats = () => {
    const total = devices.value.length
    const online = devices.value.filter(d => getStatusColor(d) === 'success').length
    const offline = devices.value.filter(d => getStatusColor(d) === 'error').length
    const warning = devices.value.filter(d => getStatusColor(d) === 'warning').length

    stats.value = { total, online, offline, warning }
  }

  const openDialog = (device?: Device) => {
    isEditing.value = !!device
    editedDevice.value = device
      ? {
        id: device.id,
        name: device.name,
        ip: device.ip,
        username: device.username,
        is_active: device.is_active,
        is_default: device.is_default,
      }
      : {
        name: '',
        ip: '',
        username: '',
        is_active: true,
        is_default: false,
      }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
    editedDevice.value = {}
    isEditing.value = false
  }

  const saveDevice = async () => {
    if (!valid.value) return

    saving.value = true
    try {
      await (isEditing.value && editedDevice.value.id ? DeviceService.updateDevice(editedDevice.value.id, editedDevice.value) : DeviceService.createDevice(editedDevice.value))

      closeDialog()
      loadDevices()
    } catch (error) {
      console.error('Erro ao salvar dispositivo:', error)
    } finally {
      saving.value = false
    }
  }

  const viewDevice = (device: Device) => {
    // TODO: Implementar visualização detalhada
    console.log('Visualizar dispositivo:', device)
  }

  const editDevice = (device: Device) => {
    openDialog(device)
  }

  const testConnection = async (device: Device) => {
    try {
      await DeviceService.testConnection(device.id)
      // TODO: Mostrar resultado do teste
      console.log('Teste de conexão realizado')
    } catch (error) {
      console.error('Erro no teste de conexão:', error)
    }
  }

  const deleteDevice = (device: Device) => {
    deviceToDelete.value = device
    deleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (!deviceToDelete.value) return

    deleting.value = true
    try {
      await DeviceService.deleteDevice(deviceToDelete.value.id)
      deleteDialog.value = false
      deviceToDelete.value = null
      loadDevices()
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error)
    } finally {
      deleting.value = false
    }
  }

  const getStatusColor = (device: Device) => {
    // Simulação de status baseado em propriedades do dispositivo
    if (!device.is_active) return 'error'
    if (device.is_default) return 'success'
    return 'warning'
  }

  const getStatusLabel = (device: Device) => {
    if (!device.is_active) return 'Inativo'
    if (device.is_default) return 'Online'
    return 'Com Problemas'
  }

  // Lifecycle
  onMounted(() => {
    loadDevices()
    loadAreas()
  })
</script>
