<script lang="ts" setup>
  import { onMounted } from 'vue'
  import PortalComponent from '@/components/portals/PortalComponent.vue'
  import { usePortalStore } from '@/stores/portal'

  const portalStore = usePortalStore()

  async function pageChanger (_page: number) {
    await portalStore.loadPortals()
  }

  async function itemsPerPageChanger (_pageSize: number) {
    await portalStore.loadPortals()
  }

  onMounted(async () => {
    await portalStore.loadPortals()
  })
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Entradas e Saídas</h1>

    <v-divider class="my-4" />

    <PortalComponent
      :current-page="1"
      :page-size="10"
      :portals="portalStore.portals"
      :total-items="portalStore.portals.length"
      :total-pages="1"
      @item-per-page="itemsPerPageChanger($event)"
      @page-changed="pageChanger($event)"
    />
  </v-container>
</template>
