<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import AccessLogsComponent from '@/components/logs/AccessLogsComponent.vue'
  import { useAccessLogStore } from '@/stores'

  const logStore = useAccessLogStore()
  const searchTerm = ref('')
  const eventTypeFilter = ref<number | null>(null)

  async function pageChanger (page: number) {
    await logStore.loadLogs({
      page,
      search: searchTerm.value || undefined,
      event_type: eventTypeFilter.value || undefined,
    })
  }

  async function itemsPerPageChanger (pageSize: number) {
    await logStore.loadLogs({
      page: 1,
      page_size: pageSize,
      search: searchTerm.value || undefined,
      event_type: eventTypeFilter.value || undefined,
    })
  }

  async function searchChanged (search: string) {
    searchTerm.value = search
    await logStore.loadLogs({
      page: 1,
      search: search || undefined,
      event_type: eventTypeFilter.value || undefined,
    })
  }

  async function filterByEventType (eventType: number | null) {
    eventTypeFilter.value = eventType
    await logStore.loadLogs({
      page: 1,
      search: searchTerm.value || undefined,
      event_type: eventType || undefined,
    })
  }

  onMounted(async () => {
    await logStore.loadLogs()
  })
</script>

<template>
  <v-container fluid>
    <h1 class="text-h4 font-weight-bold mb-4">
      <v-icon class="mr-2"> mdi-clipboard-text-clock </v-icon>
      Logs de Acesso
    </h1>

    <v-divider class="my-4" />

    <AccessLogsComponent
      :loading="logStore.loading"
      :logs="logStore.logs"
      :stats="logStore.stats"
      :total-items="logStore.totalLogs"
      @filter-event-type="filterByEventType"
      @items-per-page="itemsPerPageChanger"
      @page-changed="pageChanger"
      @search-changed="searchChanged"
    />
  </v-container>
</template>
