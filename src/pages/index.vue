<script setup lang="ts">
  import { useAccessLogStore, useUserStore } from '@/stores'
  const accessLogStore = useAccessLogStore()
  const userStore = useUserStore()
  onMounted(async () => {
    await accessLogStore.loadLogs()
    await userStore.loadUsers()
  })

  const data = [
    {
      title: 'Acessos Aprovados',
      description: 'Acessos Aprovados',
      value: accessLogStore.totalLogs.toString(),
    },
    {
      title: 'Acessos Negados',
      description: 'Acessos Negados',
      value: accessLogStore.totalLogs.toString(),
    },
    {
      title: 'Usuarios',
      description: 'Usuarios',
      value: userStore.users.length.toString(),
    },
  ]
</script>

<template>
  <v-container>
    <v-title>
      <h1>Dashboard</h1>
    </v-title>

    <v-divider class="my-4" />

    <CardsComponent
      v-for="card in data"
      :key="card.title"
      class="mb-4 max-w-sm"
      :description="card.description"
      :title="card.title"
      :value="card.value"
    />
  </v-container>
</template>

<style scoped></style>
