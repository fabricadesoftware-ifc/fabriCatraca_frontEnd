<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useUserStore } from '@/stores/user'
  const userStore = useUserStore()
  const searchTerm = ref('')

  async function pageChanger (page: number | string) {
    const pageNum = typeof page === 'number' ? page : Number(page)
    await userStore.loadUsers({
      page: pageNum,
      search: searchTerm.value || undefined,
    })
  }

  async function itemsPerPageChanger (pageSize: number | string) {
    const pageSizeNum = typeof pageSize === 'number' ? pageSize : Number(pageSize)
    await userStore.loadUsers({
      page: userStore.current_page,
      page_size: pageSizeNum,
      search: searchTerm.value || undefined,
    })
  }

  async function searchChanged (search: string | number) {
    const searchValue = typeof search === 'string' ? search : String(search)
    searchTerm.value = searchValue
    await userStore.loadUsers({
      page: 1, // Voltar para primeira página ao pesquisar
      page_size: userStore.page_size,
      search: searchValue || undefined,
    })
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
      @search-changed="searchChanged($event)"
    />
  </v-container>
</template>
