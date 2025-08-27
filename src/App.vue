<template>
  <v-app>
    <router-view />

    <v-btn
      class="elevation-6"
      color="primary"
      icon
      :loading="configStore.syncing"
      style="position: fixed; right: 24px; bottom: 24px"
      @click="syncData"
    >
      <v-tooltip activator="parent">Sincronizar dados</v-tooltip>
      <v-icon>mdi-sync</v-icon>
    </v-btn>
  </v-app>
</template>

<script lang="ts" setup>
  import { useConfigStore } from '@/stores/config'

  const configStore = useConfigStore()

  const syncData = async () => {
    try {
      await configStore.syncData()
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error)
    }
  }
</script>
