<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
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
    const acceptResponse = await accessLogStore.returnedLogsByLastDays(10, 7)
    const rejectedResponse = await accessLogStore.returnedLogsByLastDays(10, 6)

    // Extrair arrays de results ou usar o próprio valor se já for array
    acces_accept.value = Array.isArray(acceptResponse) ? acceptResponse : (acceptResponse as any)?.results || []
    acces_rejected.value = Array.isArray(rejectedResponse) ? rejectedResponse : (rejectedResponse as any)?.results || []

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

  // Dados para o gráfico
  const approvedLogs = computed(() => {
    return Array.isArray(acces_accept.value) ? acces_accept.value : []
  })

  const rejectedLogs = computed(() => {
    return Array.isArray(acces_rejected.value) ? acces_rejected.value : []
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
