<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Logs de Acesso</h1>
        </div>
      </v-col>
    </v-row>

    <AccessLogFilters
      :devices="devices"
      :loading="loading"
      :portals="portals"
      :users="users"
      @apply="applyFilters"
    />

    <AccessLogStats :stats="stats" />

    <AccessLogList
      :exporting="exporting"
      :loading="loading"
      :logs="logs"
      :total-logs="totalLogs"
      @export="exportLogs"
      @items-per-page-change="onItemsPerPageChange"
      @page-change="onPageChange"
      @refresh="loadLogs"
      @view="viewLog"
    />

    <AccessLogDetails
      v-model="logDialog"
      :log="selectedLog || undefined"
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
  import type { AccessLogs } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import AccessLogDetails from '@/components/access-logs/AccessLogDetails.vue'
  import AccessLogFilters from '@/components/access-logs/AccessLogFilters.vue'
  import AccessLogList from '@/components/access-logs/AccessLogList.vue'
  import AccessLogStats from '@/components/access-logs/AccessLogStats.vue'
  import { useAccessLog } from '@/composables/useAccessLog'
  import { useDevice } from '@/composables/useDevice'
  import { usePortal } from '@/composables/usePortal'
  import { useUser } from '@/composables/useUser'

  // Componentes

  // Composables
  const {
    logs,
    selectedLog,
    loading,
    exporting,
    totalLogs,
    stats,
    loadLogs,
    exportLogs: exportLogsAction,
  } = useAccessLog()

  const {
    devices,
    loading: loadingDevices,
    loadDevices,
  } = useDevice()

  const {
    portals,
    loading: loadingPortals,
    loadPortals,
  } = usePortal()

  const {
    users,
    loading: loadingUsers,
    loadUsers,
  } = useUser()

  // Estado local
  const logDialog = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos
  const applyFilters = (filters: any) => {
    // Reset para primeira página quando aplicar filtros
    currentPage.value = 1

    const params: any = {
      page: currentPage.value,
      limit: itemsPerPage.value,
    }

    // Adicionar filtros ativos apenas se não estiverem vazios
    if (filters.search?.trim()) params.search = filters.search.trim()
    if (filters.eventType != null) params.event_type = filters.eventType
    if (filters.device != null) params.device = filters.device
    if (filters.portal != null) params.portal = filters.portal
    if (filters.user != null) params.user = filters.user
    if (filters.dateFrom?.trim()) params.date_from = filters.dateFrom
    if (filters.dateTo?.trim()) params.date_to = filters.dateTo

    loadLogs(params)
  }

  const onPageChange = (page: number) => {
    const params: any = {
      page,
      page_size: itemsPerPage.value,
    }

    loadLogs(params)
  }

  const onItemsPerPageChange = (perPage: number) => {
    itemsPerPage.value = perPage
    currentPage.value = 1 // Voltar para primeira página ao mudar itens por página

    const params: any = {
      page: 1,
      page_size: perPage,
    }

    loadLogs(params)
  }

  const exportLogs = async () => {
    try {
      await exportLogsAction()
      showSnackbar('Logs exportados com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao exportar logs', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const viewLog = (log: AccessLogs) => {
    selectedLog.value = log
    logDialog.value = true
  }

  // Helpers
  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadLogs({ page: 1, limit: 20 })
    loadUsers()
    loadDevices()
    loadPortals()
  })
</script>
