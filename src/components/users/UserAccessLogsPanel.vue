<script lang="ts" setup>
  import type { AccessLogs } from '@/types'
  import { onMounted, ref, watch } from 'vue'
  import { useAccessLogStore } from '@/stores'

  const props = defineProps<{
    userId: number
  }>()

  const accessLogStore = useAccessLogStore()
  const logs = ref<AccessLogs[]>([])
  const loading = ref(false)
  const totalLogs = ref(0)
  const page = ref(1)
  const itemsPerPage = ref(10)

  const headers = [
    { title: 'Data/Hora', key: 'time', sortable: true },
    { title: 'Tipo', key: 'direction', sortable: false },
    { title: 'Evento', key: 'event_type', sortable: false },
    { title: 'Portal', key: 'portal', sortable: false },
    { title: 'Dispositivo', key: 'device', sortable: false },
  ]

  /**
   * Determina a direção (Entrada/Saída) com base no portal.
   * Portais possuem area_from e area_to — a passagem por um portal
   * é interpretada como "saída" de area_from e "entrada" em area_to.
   * Aqui simplificamos: se o portal tem area_to, é "Entrada"; se tem area_from, é "Saída".
   * Se não tiver portal, mostra o tipo do evento.
   */
  function getDirection (log: AccessLogs): {
    label: string
    color: string
    icon: string
  } {
    // Eventos de acesso concedido (7, 11, 12, 15) são passagens válidas
    const accessGrantedTypes = [7, 11, 12, 15]

    if (!accessGrantedTypes.includes(log.event_type)) {
      return {
        label: accessLogStore.getEventTypeLabel(log.event_type),
        color: accessLogStore.getEventTypeColor(log.event_type),
        icon: 'mdi-alert-circle-outline',
      }
    }

    if (log.portal && typeof log.portal === 'object') {
      const portal = log.portal as unknown as Record<string, unknown>
      if (portal.area_to) {
        return { label: 'Entrada', color: 'success', icon: 'mdi-login' }
      }
      if (portal.area_from) {
        return { label: 'Saída', color: 'info', icon: 'mdi-logout' }
      }
    }

    return { label: 'Acesso', color: 'success', icon: 'mdi-door-open' }
  }

  function getDeviceName (log: AccessLogs): string {
    const raw = log as unknown as Record<string, unknown>
    if (raw.device_name) return String(raw.device_name)
    if (log.device && typeof log.device === 'object') {
      const d = log.device as unknown as Record<string, unknown>
      return String(d.name || d.ip || '')
    }
    return ''
  }

  function getPortalName (log: AccessLogs): string {
    const raw = log as unknown as Record<string, unknown>
    if (raw.portal_name) return String(raw.portal_name)
    if (log.portal && typeof log.portal === 'object') {
      const p = log.portal as unknown as Record<string, unknown>
      return String(p.name || '')
    }
    return ''
  }

  async function loadUserLogs () {
    loading.value = true
    try {
      const params = {
        user: props.userId,
        page: page.value,
        page_size: itemsPerPage.value,
        ordering: '-time',
      }
      await accessLogStore.loadLogs(params)
      logs.value = accessLogStore.logs
      totalLogs.value = accessLogStore.totalLogs
    } catch (error) {
      console.error('Erro ao carregar logs do usuário:', error)
    } finally {
      loading.value = false
    }
  }

  function onUpdateOptions (options: { page: number, itemsPerPage: number }) {
    page.value = options.page
    itemsPerPage.value = options.itemsPerPage
    loadUserLogs()
  }

  watch(
    () => props.userId,
    () => {
      page.value = 1
      loadUserLogs()
    },
  )

  onMounted(() => {
    loadUserLogs()
  })
</script>

<template>
  <v-container>
    <v-data-table-server
      density="compact"
      :headers="headers"
      hover
      item-value="id"
      :items="logs"
      :items-length="totalLogs"
      :items-per-page="itemsPerPage"
      :loading="loading"
      :page="page"
      @update:options="onUpdateOptions"
    >
      <!-- Coluna Data/Hora -->
      <template #item.time="{ item }">
        <span class="text-body-2">
          {{ accessLogStore.formatDateTime(item.time) }}
        </span>
      </template>

      <!-- Coluna Tipo (Entrada/Saída) -->
      <template #item.direction="{ item }">
        <v-chip
          :color="getDirection(item).color"
          :prepend-icon="getDirection(item).icon"
          size="small"
          variant="tonal"
        >
          {{ getDirection(item).label }}
        </v-chip>
      </template>

      <!-- Coluna Evento -->
      <template #item.event_type="{ item }">
        <v-chip
          :color="accessLogStore.getEventTypeColor(item.event_type)"
          size="small"
          variant="outlined"
        >
          {{ accessLogStore.getEventTypeLabel(item.event_type) }}
        </v-chip>
      </template>

      <!-- Coluna Portal -->
      <template #item.portal="{ item }">
        <span v-if="getPortalName(item)" class="text-body-2">
          {{ getPortalName(item) }}
        </span>
        <span v-else class="text-grey text-body-2">—</span>
      </template>

      <!-- Coluna Dispositivo -->
      <template #item.device="{ item }">
        <span v-if="getDeviceName(item)" class="text-body-2">
          {{ getDeviceName(item) }}
        </span>
        <span v-else class="text-grey text-body-2">—</span>
      </template>

      <!-- Sem resultados -->
      <template #no-data>
        <div class="text-center pa-6">
          <v-icon class="mb-2" color="grey" icon="mdi-door-closed" size="48" />
          <div class="text-body-1 text-grey">
            Nenhum registro de acesso encontrado
          </div>
        </div>
      </template>
    </v-data-table-server>
  </v-container>
</template>
