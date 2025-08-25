<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Logs de Acesso</h1>
          <div>
            <v-btn
              class="mr-2"
              color="secondary"
              :loading="exporting"
              prepend-icon="mdi-download"
              variant="outlined"
              @click="exportLogs"
            >
              Exportar
            </v-btn>
            <v-btn
              color="primary"
              :loading="loading"
              prepend-icon="mdi-refresh"
              @click="loadLogs"
            >
              Atualizar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filtros Avançados -->
    <v-expansion-panels class="mb-6">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon class="mr-2">mdi-filter</v-icon>
          Filtros Avançados
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.search"
                clearable
                density="compact"
                label="Buscar"
                placeholder="Usuário, dispositivo, portal..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.eventType"
                clearable
                density="compact"
                item-title="title"
                item-value="value"
                :items="eventTypes"
                label="Tipo de Evento"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.device"
                clearable
                density="compact"
                item-title="name"
                item-value="id"
                :items="devices"
                label="Dispositivo"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.portal"
                clearable
                density="compact"
                item-title="name"
                item-value="id"
                :items="portals"
                label="Portal"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.dateFrom"
                density="compact"
                label="Data Inicial"
                type="datetime-local"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.dateTo"
                density="compact"
                label="Data Final"
                type="datetime-local"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.user"
                clearable
                density="compact"
                item-title="name"
                item-value="id"
                :items="users"
                label="Usuário"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-btn
                block
                color="primary"
                :loading="loading"
                @click="applyFilters"
              >
                Aplicar Filtros
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Estatísticas -->
    <v-row class="mb-6">
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="success" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-check-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.granted }}</div>
              <div class="text-subtitle-1">Acessos Concedidos</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="error" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-close-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.denied }}</div>
              <div class="text-subtitle-1">Acessos Negados</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="warning" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-alert-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.pending }}</div>
              <div class="text-subtitle-1">Acessos Pendentes</div>
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
              <div class="text-subtitle-1">Total de Eventos</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabela de Logs -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-0"
            :headers="headers"
            hide-default-footer
            :items="logs"
            :items-per-page="itemsPerPage"
            :loading="loading"
          >
            <template #bottom>
              <div class="d-flex justify-center align-center pa-4 flex-column">
                <div class="d-flex justify-center align-center">
                  <v-pagination
                    v-model="currentPage"
                    :length="Math.ceil(totalLogs / itemsPerPage)"
                    rounded="circle"
                    :total-visible="7"
                    @update:model-value="onPageChange"
                  />
                </div>
                <div class="d-flex align-center mt-2">
                  <span class="text-caption mr-2">Itens por página:</span>
                  <v-select
                    v-model="itemsPerPage"
                    class="items-per-page-select"
                    density="compact"
                    hide-details
                    :items="[10, 20, 50, 100]"
                    style="max-width: 100px;"
                    variant="outlined"
                    @update:model-value="onItemsPerPageChange"
                  />
                  <span class="text-caption ml-4">
                    Total: {{ totalLogs }} itens
                  </span>
                </div>
              </div>
            </template>

            <template #[`item.time`]="{ item }">
              <div class="text-caption">
                {{ formatDateTime(item.time) }}
              </div>
            </template>

            <template #[`item.event_type`]="{ item }">
              <v-chip
                :color="getEventTypeColor(item.event_type)"
                size="small"
              >
                {{ getEventTypeLabel(item.event_type) }}
              </v-chip>
            </template>

            <template #[`item.user`]="{ item }">
              <div v-if="item.user">
                <div class="font-weight-medium">{{ item.user.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.user.registration }}
                </div>
              </div>
              <span v-else class="text-medium-emphasis">N/A</span>
            </template>

            <template #[`item.device`]="{ item }">
              <div v-if="item.device">
                <div class="font-weight-medium">{{ item.device.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.device.ip }}
                </div>
              </div>
              <span v-else class="text-medium-emphasis">N/A</span>
            </template>

            <template #[`item.portal`]="{ item }">
              <div v-if="item.portal">
                <div class="font-weight-medium">{{ item.portal.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.portal.area_from?.name }} → {{ item.portal.area_to?.name }}
                </div>
              </div>
              <span v-else class="text-medium-emphasis">N/A</span>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn
                color="info"
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewLog(item)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Detalhes do Log -->
    <v-dialog
      v-model="logDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Detalhes do Log de Acesso</span>
        </v-card-title>

        <v-card-text>
          <v-row v-if="selectedLog">
            <v-col cols="12" md="6">
              <h3 class="text-h6 mb-3">Informações Gerais</h3>
              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title>ID do Evento</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.id }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Data/Hora</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(selectedLog.time) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Tipo de Evento</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getEventTypeColor(selectedLog.event_type)"
                      size="small"
                    >
                      {{ getEventTypeLabel(selectedLog.event_type) }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Confiança</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.confidence }}%</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <h3 class="text-h6 mb-3">Usuário</h3>
              <v-list v-if="selectedLog.user" density="compact">
                <v-list-item>
                  <v-list-item-title>Nome</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.user.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Matrícula</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.user.registration }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Tipo</v-list-item-title>
                  <v-list-item-subtitle>{{ getUserTypeLabel(selectedLog.user.user_type_id) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="tonal">
                Usuário não identificado
              </v-alert>
            </v-col>

            <v-col cols="12" md="6">
              <h3 class="text-h6 mb-3">Dispositivo</h3>
              <v-list v-if="selectedLog.device" density="compact">
                <v-list-item>
                  <v-list-item-title>Nome</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.device.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>IP</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.device.ip }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Usuário</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.device.username }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <h3 class="text-h6 mb-3">Portal</h3>
              <v-list v-if="selectedLog.portal" density="compact">
                <v-list-item>
                  <v-list-item-title>Nome</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.portal.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Origem</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.portal.area_from?.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Destino</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedLog.portal.area_to?.name }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12">
              <h3 class="text-h6 mb-3">Dados de Identificação</h3>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    density="compact"
                    label="QR Code"
                    :model-value="selectedLog.qr_code || 'N/A'"
                    readonly
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    density="compact"
                    label="UHF"
                    :model-value="selectedLog.uhf_value || 'N/A'"
                    readonly
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    density="compact"
                    label="PIN"
                    :model-value="selectedLog.pin_value || 'N/A'"
                    readonly
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    density="compact"
                    label="Cartão"
                    :model-value="selectedLog.card_value || 'N/A'"
                    readonly
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="logDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  // @ts-ignore
  import type { AccessLogs, Device, Portal, User } from '@/types'
  import { onMounted, ref } from 'vue'
  // @ts-ignore
  import { AccessLogsService, DeviceService, PortalsService, UsersService } from '@/services'

  // Estado reativo
  const logs = ref<AccessLogs[]>([])
  const users = ref<User[]>([])
  const devices = ref<Device[]>([])
  const portals = ref<Portal[]>([])
  const loading = ref(false)
  const exporting = ref(false)
  const logDialog = ref(false)
  const selectedLog = ref<AccessLogs | null>(null)
  const totalLogs = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)

  // Filtros
  const filters = ref({
    search: '',
    eventType: null,
    device: null,
    portal: null,
    dateFrom: '',
    dateTo: '',
    user: null,
  })

  // Estatísticas
  const stats = ref({
    granted: 0,
    denied: 0,
    pending: 0,
    total: 0,
  })

  // Headers da tabela
  const headers = [
    { title: 'Data/Hora', key: 'time', sortable: true, width: '150px' },
    { title: 'Tipo', key: 'event_type', sortable: true, width: '120px' },
    { title: 'Usuário', key: 'user', sortable: true, width: '200px' },
    { title: 'Dispositivo', key: 'device', sortable: true, width: '180px' },
    { title: 'Portal', key: 'portal', sortable: true, width: '200px' },
    { title: 'Ações', key: 'actions', sortable: false, width: '80px' },
  ]

  // Tipos de eventos
  const eventTypes = [
    { title: 'Equipamento Inválido', value: 1 },
    { title: 'Parâmetros Inválidos', value: 2 },
    { title: 'Não Identificado', value: 3 },
    { title: 'Identificação Pendente', value: 4 },
    { title: 'Tempo Esgotado', value: 5 },
    { title: 'Acesso Negado', value: 6 },
    { title: 'Acesso Concedido', value: 7 },
    { title: 'Acesso Pendente', value: 8 },
    { title: 'Não é Administrador', value: 9 },
    { title: 'Acesso Não Identificado', value: 10 },
    { title: 'Acesso por Botoeira', value: 11 },
    { title: 'Acesso pela Interface Web', value: 12 },
    { title: 'Desistência', value: 13 },
    { title: 'Sem Resposta', value: 14 },
    { title: 'Acesso pela Interfonia', value: 15 },
  ]

  // Métodos
  const loadLogs = async (params = {}) => {
    loading.value = true
    console.log('[access-logs.vue] Parâmetros enviados para getAccessLogs:', params)
    try {
      const response = await AccessLogsService.getAccessLogs(params)
      console.log('[access-logs.vue] Resposta recebida:', response)
      // Atualizar dados apenas se a resposta for válida
      if (response && Array.isArray(response.results)) {
        logs.value = response.results
        totalLogs.value = response.count || 0
        updateStats()
      } else {
        console.error('Resposta inválida da API:', response)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      loading.value = false
    }
  }

  const loadUsers = async () => {
    try {
      const response = await UsersService.getUsers()
      users.value = response.results
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const loadDevices = async () => {
    try {
      const response = await DeviceService.getDevices()
      devices.value = response.results
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    }
  }

  const loadPortals = async () => {
    try {
      const response = await PortalsService.getPortals()
      portals.value = response.results
    } catch (error) {
      console.error('Erro ao carregar portais:', error)
    }
  }

  const applyFilters = () => {
    // Reset para primeira página quando aplicar filtros
    currentPage.value = 1

    const params: any = {
      page: currentPage.value,
      limit: itemsPerPage.value,
    }

    // Adicionar filtros ativos apenas se não estiverem vazios
    if (filters.value.search && filters.value.search.trim()) {
      params.search = filters.value.search.trim()
    }
    if (filters.value.eventType !== null && filters.value.eventType !== undefined) {
      params.event_type = filters.value.eventType
    }
    if (filters.value.device !== null && filters.value.device !== undefined) {
      params.device = filters.value.device
    }
    if (filters.value.portal !== null && filters.value.portal !== undefined) {
      params.portal = filters.value.portal
    }
    if (filters.value.user !== null && filters.value.user !== undefined) {
      params.user = filters.value.user
    }
    if (filters.value.dateFrom && filters.value.dateFrom.trim()) {
      params.date_from = filters.value.dateFrom
    }
    if (filters.value.dateTo && filters.value.dateTo.trim()) {
      params.date_to = filters.value.dateTo
    }

    loadLogs(params)
  }

  const onPageChange = (page: number) => {
    const params: any = {
      page,
      page_size: itemsPerPage.value,
    }

    // Adicionar filtros ativos
    if (filters.value.search?.trim()) params.search = filters.value.search.trim()
    if (filters.value.eventType != null) params.event_type = filters.value.eventType
    if (filters.value.device != null) params.device = filters.value.device
    if (filters.value.portal != null) params.portal = filters.value.portal
    if (filters.value.user != null) params.user = filters.value.user
    if (filters.value.dateFrom?.trim()) params.date_from = filters.value.dateFrom
    if (filters.value.dateTo?.trim()) params.date_to = filters.value.dateTo

    loadLogs(params)
  }

  const onItemsPerPageChange = (perPage: number) => {
    itemsPerPage.value = perPage
    currentPage.value = 1 // Voltar para primeira página ao mudar itens por página

    const params: any = {
      page: 1,
      page_size: perPage,
    }

    // Adicionar filtros ativos
    if (filters.value.search?.trim()) params.search = filters.value.search.trim()
    if (filters.value.eventType != null) params.event_type = filters.value.eventType
    if (filters.value.device != null) params.device = filters.value.device
    if (filters.value.portal != null) params.portal = filters.value.portal
    if (filters.value.user != null) params.user = filters.value.user
    if (filters.value.dateFrom?.trim()) params.date_from = filters.value.dateFrom
    if (filters.value.dateTo?.trim()) params.date_to = filters.value.dateTo

    loadLogs(params)
  }

  const exportLogs = async () => {
    exporting.value = true
    try {
      // TODO: Implementar exportação
      console.log('Exportando logs...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulação
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
    } finally {
      exporting.value = false
    }
  }

  const viewLog = (log: AccessLogs) => {
    selectedLog.value = log
    logDialog.value = true
  }

  const updateStats = () => {
    const total = totalLogs.value // Usar o total real de registros
    const granted = logs.value.filter(log => log.event_type === 7).length
    const denied = logs.value.filter(log => [1, 2, 6, 9].includes(log.event_type)).length
    const pending = logs.value.filter(log => [4, 8].includes(log.event_type)).length

    stats.value = { total, granted, denied, pending }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR')
  }

  const getEventTypeColor = (eventType: number) => {
    const colors: Record<number, string> = {
      1: 'error', // Equipamento inválido
      2: 'error', // Parâmetros inválidos
      3: 'warning', // Não identificado
      4: 'warning', // Identificação pendente
      5: 'warning', // Tempo esgotado
      6: 'error', // Acesso negado
      7: 'success', // Acesso concedido
      8: 'warning', // Acesso pendente
      9: 'error', // Não é administrador
      10: 'info', // Acesso não identificado
      11: 'success', // Acesso por botoeira
      12: 'success', // Acesso pela interface web
      13: 'info', // Desistência
      14: 'grey', // Sem resposta
      15: 'success', // Acesso pela interfonia
    }
    return colors[eventType] || 'grey'
  }

  const getEventTypeLabel = (eventType: number) => {
    const eventTypeObj = eventTypes.find(type => type.value === eventType)
    return eventTypeObj?.title || 'Desconhecido'
  }

  const getUserTypeLabel = (userTypeId: number) => {
    const userTypes: Record<number, string> = {
      1: 'Aluno',
      2: 'Professor',
      3: 'Funcionário',
      4: 'Administrador',
    }
    return userTypes[userTypeId] || 'Desconhecido'
  }

  // Lifecycle
  onMounted(() => {
    loadLogs({ page: 1, limit: 20 })
    loadUsers()
    loadDevices()
    loadPortals()
  })
</script>
