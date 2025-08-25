<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Painel Administrativo</h1>
      </v-col>
    </v-row>

    <!-- Cards de Status -->
    <v-row>
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="primary" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-account-group</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.totalUsers }}</div>
              <div class="text-subtitle-1">Usuários</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="success" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-door-open</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.activeDevices }}</div>
              <div class="text-subtitle-1">Catracas Ativas</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="info" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-access-point</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.totalAccesses }}</div>
              <div class="text-subtitle-1">Acessos Hoje</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="warning" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-alert-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.blockedAttempts }}</div>
              <div class="text-subtitle-1">Tentativas Bloqueadas</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Navegação Rápida -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Gerenciamento Rápido</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="section in sections"
        :key="section.title"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-card
          class="pa-4 text-center cursor-pointer"
          hover
          @click="navigateTo(section.route)"
        >
          <v-icon class="mb-3" :color="section.color" size="48">
            {{ section.icon }}
          </v-icon>
          <h3 class="text-h6 mb-2">{{ section.title }}</h3>
          <p class="text-body-2 text-medium-emphasis">{{ section.description }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Últimos Acessos -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Últimos Acessos</span>
            <v-btn
              color="primary"
              variant="text"
              @click="navigateTo('/admin/access-logs')"
            >
              Ver Todos
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              class="elevation-0"
              :headers="accessLogHeaders"
              :items="recentAccessLogs"
              :loading="loadingAccessLogs"
            >
              <template #item.time="{ item }">
                {{ formatDateTime(item.time) }}
              </template>
              <template #item.event_type="{ item }">
                <v-chip
                  :color="getEventTypeColor(item.event_type)"
                  size="small"
                >
                  {{ getEventTypeLabel(item.event_type) }}
                </v-chip>
              </template>
              <template #item.user="{ item }">
                {{ item.user?.name || 'N/A' }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import type { AccessLogs } from '@/types'
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { AccessLogsService } from '@/services'

  const router = useRouter()

  // Estado reativo
  const stats = ref({
    totalUsers: 0,
    activeDevices: 0,
    totalAccesses: 0,
    blockedAttempts: 0,
  })

  const recentAccessLogs = ref<AccessLogs[]>([])
  const loadingAccessLogs = ref(false)

  // Seções de navegação
  const sections = [
    {
      title: 'Usuários',
      description: 'Gerenciar alunos e funcionários',
      icon: 'mdi-account-group',
      color: 'primary',
      route: '/users',
    },
    {
      title: 'Catracas',
      description: 'Configurar dispositivos de acesso',
      icon: 'mdi-door-open',
      color: 'success',
      route: '/devices',
    },
    {
      title: 'Áreas',
      description: 'Definir zonas de acesso',
      icon: 'mdi-map-marker',
      color: 'info',
      route: '/areas',
    },
    {
      title: 'Grupos',
      description: 'Organizar usuários em grupos',
      icon: 'mdi-account-multiple',
      color: 'warning',
      route: '/groups',
    },
    {
      title: 'Regras de Acesso',
      description: 'Configurar permissões',
      icon: 'mdi-shield-account',
      color: 'error',
      route: '/access-rules',
    },
    {
      title: 'Horários',
      description: 'Definir janelas de acesso',
      icon: 'mdi-clock',
      color: 'purple',
      route: '/time-zones',
    },
    {
      title: 'Portais',
      description: 'Gerenciar pontos de acesso',
      icon: 'mdi-door',
      color: 'teal',
      route: '/portals',
    },
    {
      title: 'Logs de Acesso',
      description: 'Visualizar histórico',
      icon: 'mdi-file-document',
      color: 'grey',
      route: '/access-logs',
    },
  ]

  // Headers da tabela de logs
  const accessLogHeaders = [
    { title: 'Data/Hora', key: 'time', sortable: true },
    { title: 'Usuário', key: 'user', sortable: true },
    { title: 'Dispositivo', key: 'device.name', sortable: true },
    { title: 'Tipo de Evento', key: 'event_type', sortable: true },
    { title: 'Portal', key: 'portal.name', sortable: true },
  ]

  // Métodos
  const navigateTo = (route: string) => {
    router.push(route)
  }

  const loadStats = async () => {
    // TODO: Implementar carregamento de estatísticas
    stats.value = {
      totalUsers: 1250,
      activeDevices: 8,
      totalAccesses: 3420,
      blockedAttempts: 45,
    }
  }

  const loadRecentAccessLogs = async () => {
    loadingAccessLogs.value = true
    try {
      const response = await AccessLogsService.getAccessLogs({ limit: 10 })
      recentAccessLogs.value = response.results
    } catch (error) {
      console.error('Erro ao carregar logs de acesso:', error)
    } finally {
      loadingAccessLogs.value = false
    }
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
    const labels: Record<number, string> = {
      1: 'Equipamento Inválido',
      2: 'Parâmetros Inválidos',
      3: 'Não Identificado',
      4: 'Identificação Pendente',
      5: 'Tempo Esgotado',
      6: 'Acesso Negado',
      7: 'Acesso Concedido',
      8: 'Acesso Pendente',
      9: 'Não é Administrador',
      10: 'Acesso Não Identificado',
      11: 'Acesso por Botoeira',
      12: 'Acesso pela Interface Web',
      13: 'Desistência',
      14: 'Sem Resposta',
      15: 'Acesso pela Interfonia',
    }
    return labels[eventType] || 'Desconhecido'
  }

  // Lifecycle
  onMounted(() => {
    loadStats()
    loadRecentAccessLogs()
  })
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
