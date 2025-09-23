<script setup lang="ts">
  import type { AccessLogs } from '@/types'
  import { computed } from 'vue'
  import { useAccessLogStore, useUserStore } from '@/stores'

  const accessLogStore = useAccessLogStore()
  const userStore = useUserStore()
  const acces_accept = ref<any>()
  const acces_rejected = ref<any>()
  const count_approved = ref(0)
  const count_rejected = ref(0)

  onMounted(async () => {
    await accessLogStore.loadLogs()
    await userStore.loadUsers()
    acces_accept.value = await accessLogStore.returnedLogsByLastDays(10, 7) as unknown as AccessLogs
    acces_rejected.value = await accessLogStore.returnedLogsByLastDays(10, 6) as unknown as AccessLogs

    // Contar os logs
    count_approved.value = (await accessLogStore.returnedTypedLogs(7)).count
    count_rejected.value = (await accessLogStore.returnedTypedLogs(6)).count
  })

  const data = computed(() => [
    {
      title: 'Acessos Aprovados',
      description: 'Total de acessos concedidos com sucesso',
      value: count_approved.value,
      trend: 'up' as const,
      trendValue: '+12%',
      color: '', // Sem cor específica, deixar o CSS controlar
      icon: 'mdi-check-circle',
      iconColor: 'success', // Ícone verde
      variant: 'light' as const, // Modo claro
    },
    {
      title: 'Acessos Negados',
      description: 'Total de tentativas de acesso rejeitadas',
      value: count_rejected.value,
      trend: 'down' as const,
      trendValue: '-5%',
      color: '', // Sem cor específica, deixar o CSS controlar
      icon: 'mdi-close-circle',
      iconColor: 'error', // Ícone vermelho
      variant: 'light' as const, // Modo claro
    },
    {
      title: 'Usuários',
      description: 'Total de usuários cadastrados no sistema',
      value: userStore.count,
      trend: 'up' as const,
      trendValue: '+3%',
      color: '', // Sem cor específica, deixar o CSS controlar
      icon: 'mdi-account-group',
      iconColor: 'info', // Ícone azul
      variant: 'light' as const, // Modo claro
    },
  ])

  // Dados para o gráfico (últimos 30 logs)
  const approvedLogs = computed(() => {
    if (acces_accept.value && acces_accept.value) {
      return acces_accept.value
    }
    return []
  })
  const rejectedLogs = computed(() => {
    if (acces_rejected.value && acces_rejected.value) {
      return acces_rejected.value
    }
    return []
  })
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Dashboard</h1>

    <v-divider class="my-4" />

    <v-row>
      <v-col
        v-for="card in data"
        :key="card.title"
        cols="12"
        md="4"
        sm="6"
      >
        <CardsComponent
          :color="card.color"
          :description="card.description"
          :icon="card.icon"
          :icon-color="card.iconColor"
          :title="card.title"
          :trend="card.trend"
          :trend-value="card.trendValue"
          :value="card.value"
          :variant="card.variant"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="16"
      >
        <HomeGraph
          :approved-logs="approvedLogs"
          :rejected-logs="rejectedLogs"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
