<script lang="ts" setup>
  import { onMounted } from 'vue'
  import GroupComponent from '@/components/groups/GroupComponent.vue'
  import { useGroupStore } from '@/stores'

  const groupStore = useGroupStore()

  async function pageChanger (page: number) {
    await groupStore.loadGroups({ page })
  }

  async function itemsPerPageChanger (pageSize: number) {
    await groupStore.loadGroups({
      page: groupStore.current_page,
      page_size: pageSize,
    })
  }

  onMounted(async () => {
    await groupStore.loadGroups()
  })
</script>
<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Grupos</h1>

    <v-divider class="my-4" />

    <GroupComponent
      :current-page="groupStore.current_page"
      :groups="groupStore.groups"
      :page-size="groupStore.page_size"
      :total-items="groupStore.count"
      :total-pages="groupStore.total_pages"
      @item-per-page="itemsPerPageChanger($event)"
      @page-changed="pageChanger($event)"
    />
  </v-container>
</template>
