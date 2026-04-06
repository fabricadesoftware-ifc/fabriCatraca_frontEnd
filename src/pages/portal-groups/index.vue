<script setup lang="ts">
  import { onMounted } from 'vue'
  import PortalGroupComponent from '@/components/portal-groups/PortalGroupComponent.vue'
  import { usePortalGroupStore } from '@/stores/portalGroup'

  const portalGroupStore = usePortalGroupStore()

  async function pageChanger (page: number) {
    await portalGroupStore.loadPortalGroups({ page })
  }

  async function itemsPerPageChanger (pageSize: number) {
    await portalGroupStore.loadPortalGroups({
      page: portalGroupStore.current_page,
      page_size: pageSize,
    })
  }

  onMounted(async () => {
    await portalGroupStore.loadPortalGroups()
  })
</script>
<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Grupos de Portais</h1>

    <v-divider class="my-4" />

    <PortalGroupComponent
      :portal-groups="portalGroupStore.portalGroups"
      :current-page="portalGroupStore.current_page"
      :page-size="portalGroupStore.page_size"
      :total-items="portalGroupStore.count"
      :total-pages="portalGroupStore.total_pages"
      @item-per-page="itemsPerPageChanger($event)"
      @page-changed="pageChanger($event)"
    />
  </v-container>
</template>
