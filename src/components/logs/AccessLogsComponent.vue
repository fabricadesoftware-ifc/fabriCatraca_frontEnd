<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useAccessLogStore } from '@/stores'

  type LogEntry = Record<string, unknown>

  const props = defineProps<{
    logs: LogEntry[]
    loading: boolean
    totalItems: number
    stats: {
      granted: number
      denied: number
      pending: number
      total: number
    }
  }>()

  const emit = defineEmits<{
    (e: 'page-changed', page: number): void
    (e: 'items-per-page', size: number): void
    (e: 'search-changed', search: string): void
    (e: 'filter-event-type', eventType: number | null): void
  }>()

  const logStore = useAccessLogStore()
  const search = ref('')
  const selectedEventType = ref<number | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const detailDialog = ref(false)
  const selectedLog = ref<LogEntry | null>(null)

  const headers = [
    { title: 'Data/Hora', key: 'time', align: 'start' as const, width: '180px' },
    { title: 'Usuário', key: 'user', align: 'start' as const },
    {
      title: 'Tipo de Evento',
      key: 'event_type',
      align: 'center' as const,
      width: '200px',
    },
    { title: 'Dispositivo', key: 'device', align: 'start' as const },
    { title: 'Portal', key: 'portal', align: 'start' as const },
    {
      title: 'Ações',
      key: 'actions',
      align: 'center' as const,
      width: '100px',
      sortable: false,
    },
  ]

  const eventTypeOptions = [
    { title: 'Todos', value: null },
    { title: 'Acesso Concedido', value: 7 },
    { title: 'Acesso Negado', value: 6 },
    { title: 'Acesso Pendente', value: 8 },
    { title: 'Não Identificado', value: 3 },
    { title: 'Tempo Esgotado', value: 5 },
    { title: 'Acesso por Botoeira', value: 11 },
    { title: 'Acesso pela Interface Web', value: 12 },
  ]

  const totalPages = computed(() =>
    Math.ceil(props.totalItems / itemsPerPage.value),
  )

  function formatDateTime (dateTime: string) {
    if (!dateTime) return '-'
    const date = new Date(dateTime)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function getUserName (log: LogEntry) {
    // Formato API simplificado
    if (log.user_name) return String(log.user_name)
    // Formato com objetos aninhados
    const user = log.user
    if (user && typeof user === 'object') {
      const u = user as Record<string, unknown>
      if (u.name) return String(u.name)
      if (u.registration) return `Matrícula: ${u.registration}`
    }
    if (log.identifier_id) return `ID: ${log.identifier_id}`
    return 'Não identificado'
  }

  function getDeviceName (log: LogEntry) {
    // Formato API simplificado
    if (log.device_name) return String(log.device_name)
    // Formato com objetos aninhados
    const device = log.device
    if (device && typeof device === 'object') {
      const d = device as Record<string, unknown>
      return String(d.name || d.ip || '-')
    }
    return '-'
  }

  function getPortalName (log: LogEntry) {
    // Formato API simplificado
    if (log.portal_name) return String(log.portal_name)
    // Formato com objetos aninhados
    const portal = log.portal
    if (portal && typeof portal === 'object') {
      const p = portal as Record<string, unknown>
      return String(p.name || '-')
    }
    return '-'
  }

  function onSearch () {
    currentPage.value = 1
    emit('search-changed', search.value)
  }

  function onFilterChange () {
    currentPage.value = 1
    emit('filter-event-type', selectedEventType.value)
  }

  function onPageChange (page: number) {
    currentPage.value = page
    emit('page-changed', page)
  }

  function onItemsPerPageChange (size: number) {
    itemsPerPage.value = size
    currentPage.value = 1
    emit('items-per-page', size)
  }

  function showDetails (log: LogEntry) {
    selectedLog.value = log
    detailDialog.value = true
  }

  function getEventIcon (eventType: number) {
    const icons: Record<number, string> = {
      6: 'mdi-close-circle',
      7: 'mdi-check-circle',
      8: 'mdi-clock-outline',
      3: 'mdi-help-circle',
      5: 'mdi-timer-off',
      11: 'mdi-button-pointer',
      12: 'mdi-web',
      13: 'mdi-exit-run',
      15: 'mdi-phone',
    }
    return icons[eventType] || 'mdi-information'
  }
</script>

<template>
  <div>
    <!-- Cards de Estatísticas -->
    <v-row class="mb-4">
      <v-col cols="12" md="3" sm="6">
        <v-card color="primary" variant="tonal">
          <v-card-text class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">
                {{ stats.total }}
              </div>
              <div class="text-subtitle-1">Total de Registros</div>
            </div>
            <v-icon color="primary" size="48"> mdi-clipboard-list </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card color="success" variant="tonal">
          <v-card-text class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">
                {{ stats.granted }}
              </div>
              <div class="text-subtitle-1">Acessos Concedidos</div>
            </div>
            <v-icon color="success" size="48"> mdi-check-circle </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card color="error" variant="tonal">
          <v-card-text class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">
                {{ stats.denied }}
              </div>
              <div class="text-subtitle-1">Acessos Negados</div>
            </div>
            <v-icon color="error" size="48"> mdi-close-circle </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card color="warning" variant="tonal">
          <v-card-text class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">
                {{ stats.pending }}
              </div>
              <div class="text-subtitle-1">Pendentes</div>
            </div>
            <v-icon color="warning" size="48"> mdi-clock-outline </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              clearable
              density="compact"
              hide-details
              label="Buscar por usuário, matrícula..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              @click:clear="
                search = '';
                onSearch();
              "
              @keyup.enter="onSearch"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedEventType"
              clearable
              density="compact"
              hide-details
              :items="eventTypeOptions"
              label="Tipo de Evento"
              prepend-inner-icon="mdi-filter"
              variant="outlined"
              @update:model-value="onFilterChange"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              block
              color="primary"
              prepend-icon="mdi-magnify"
              @click="onSearch"
            >
              Buscar
            </v-btn>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              block
              color="secondary"
              prepend-icon="mdi-refresh"
              variant="outlined"
              @click="
                search = '';
                selectedEventType = null;
                onSearch();
                onFilterChange();
              "
            >
              Limpar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabela de Logs -->
    <v-card>
      <v-data-table
        class="rounded-lg"
        density="comfortable"
        :headers="headers"
        hover
        item-value="id"
        :items="logs"
        :items-per-page="itemsPerPage"
        :loading="loading"
      >
        <template #item.time="{ item }">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="grey" size="small">
              mdi-clock-outline
            </v-icon>
            <span class="text-body-2">{{
              formatDateTime(String(item.time || ""))
            }}</span>
          </div>
        </template>

        <template #item.user="{ item }">
          <div class="d-flex align-center">
            <v-avatar class="mr-2" color="primary" size="32">
              <span class="text-caption">{{
                getUserName(item).charAt(0).toUpperCase()
              }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">
                {{ getUserName(item) }}
              </div>
              <div v-if="item.user_id" class="text-caption text-grey">
                ID: {{ item.user_id }}
              </div>
            </div>
          </div>
        </template>

        <template #item.event_type="{ item }">
          <v-chip
            :color="logStore.getEventTypeColor(Number(item.event_type))"
            :prepend-icon="getEventIcon(Number(item.event_type))"
            size="small"
          >
            {{ logStore.getEventTypeLabel(Number(item.event_type)) }}
          </v-chip>
        </template>

        <template #item.device="{ item }">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="grey" size="small">
              mdi-turnstile
            </v-icon>
            {{ getDeviceName(item) }}
          </div>
        </template>

        <template #item.portal="{ item }">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="grey" size="small"> mdi-door </v-icon>
            {{ getPortalName(item) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            color="primary"
            icon="mdi-eye"
            size="small"
            variant="text"
            @click="showDetails(item)"
          />
        </template>

        <template #bottom>
          <v-divider />
          <div class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <span class="text-body-2 mr-2">Itens por página:</span>
              <v-select
                v-model="itemsPerPage"
                density="compact"
                hide-details
                :items="[10, 25, 50, 100]"
                style="max-width: 80px"
                variant="outlined"
                @update:model-value="onItemsPerPageChange"
              />
            </div>
            <div class="text-body-2">
              Mostrando {{ logs.length }} de {{ totalItems }} registros
            </div>
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="5"
              @update:model-value="onPageChange"
            />
          </div>
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon class="mb-4" color="grey" size="64">
              mdi-clipboard-text-off
            </v-icon>
            <p class="text-h6 text-grey">Nenhum log encontrado</p>
            <p class="text-body-2 text-grey">
              Tente ajustar os filtros ou aguarde novos registros
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de Detalhes -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card v-if="selectedLog">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2"> mdi-information </v-icon>
          Detalhes do Log
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="detailDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="primary"> mdi-clock </v-icon>
              </template>
              <v-list-item-title>Data/Hora</v-list-item-title>
              <v-list-item-subtitle>{{
                formatDateTime(String(selectedLog.time || ""))
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary"> mdi-account </v-icon>
              </template>
              <v-list-item-title>Usuário</v-list-item-title>
              <v-list-item-subtitle>{{
                getUserName(selectedLog)
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="selectedLog.user_id">
              <template #prepend>
                <v-icon color="primary"> mdi-identifier </v-icon>
              </template>
              <v-list-item-title>ID do Usuário</v-list-item-title>
              <v-list-item-subtitle>{{
                selectedLog.user_id
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon
                  :color="
                    logStore.getEventTypeColor(Number(selectedLog.event_type))
                  "
                >
                  {{ getEventIcon(Number(selectedLog.event_type)) }}
                </v-icon>
              </template>
              <v-list-item-title>Tipo de Evento</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="
                    logStore.getEventTypeColor(Number(selectedLog.event_type))
                  "
                  size="small"
                >
                  {{
                    logStore.getEventTypeLabel(Number(selectedLog.event_type))
                  }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary"> mdi-turnstile </v-icon>
              </template>
              <v-list-item-title>Dispositivo</v-list-item-title>
              <v-list-item-subtitle>{{
                getDeviceName(selectedLog)
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary"> mdi-door </v-icon>
              </template>
              <v-list-item-title>Portal</v-list-item-title>
              <v-list-item-subtitle>{{
                getPortalName(selectedLog)
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="selectedLog.portal_id">
              <template #prepend>
                <v-icon color="primary"> mdi-identifier </v-icon>
              </template>
              <v-list-item-title>ID do Portal</v-list-item-title>
              <v-list-item-subtitle>{{
                selectedLog.portal_id
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="selectedLog.device_id">
              <template #prepend>
                <v-icon color="primary"> mdi-identifier </v-icon>
              </template>
              <v-list-item-title>ID do Dispositivo</v-list-item-title>
              <v-list-item-subtitle>{{
                selectedLog.device_id
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="detailDialog = false">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
