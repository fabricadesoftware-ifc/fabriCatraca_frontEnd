<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useUserStore } from '@/stores/user'
  const userStore = useUserStore()

  async function pageChanger (page: number) {
    await userStore.loadUsers({ page: page })
  }
  async function itemsPerPageChanger (pageSize: number) {
    await userStore.loadUsers({ page: userStore.current_page, page_size: pageSize })
  }

  onMounted(async () => {
    await userStore.loadUsers()
  })
</script>
<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Usuario</h1>

    <v-divider class="my-4" />

    <UserComponent
      :current-page="userStore.current_page"
      :page-size="userStore.page_size"
      :total-items="userStore.count"
      :total-pages="userStore.total_pages"
      :users="userStore.users"
      @item-per-page="itemsPerPageChanger($event)"
      @page-changed="pageChanger($event)"
    />
  </v-container>
</template>
