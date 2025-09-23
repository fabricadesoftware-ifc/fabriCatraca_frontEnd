<script setup lang="ts">
import { onMounted } from 'vue'
import { useAreaStore } from '@/stores'
import AreaComponent from '@/components/areas/AreaComponent.vue'

const areaStore = useAreaStore()

async function pageChanger (page: number) {
  await areaStore.loadAreas({ page })
}

async function itemsPerPageChanger (pageSize: number) {
  await areaStore.loadAreas({
    page: areaStore.current_page,
    page_size: pageSize,
  })
}

onMounted(async () => {
  await areaStore.loadAreas()
})
</script>
<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Areas</h1>

    <v-divider class="my-4" />

    <AreaComponent
    :areas="areaStore.areas"
    :current-page="areaStore.current_page"
    :page-size="areaStore.page_size"
    :total-items="areaStore.count"
    :total-pages="areaStore.total_pages"
    @item-per-page="itemsPerPageChanger($event)"
    @page-changed="pageChanger($event)" />
    <!-- <GroupComponent
      :current-page="groupStore.current_page"
      :groups="groupStore.groups"
      :page-size="groupStore.page_size"
      :total-items="groupStore.count"
      :total-pages="groupStore.total_pages"
      @item-per-page="itemsPerPageChanger($event)"
      @page-changed="pageChanger($event)"
    /> -->
  </v-container>
</template>
