<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useUserStore } from '@/stores/user'
  const userStore = useUserStore()
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(0)

  onMounted(async () => {
    await userStore.loadUsers()
  })
</script>
<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Usuario</h1>

    <v-divider class="my-4" />

    <UserComponent
      :current-page="currentPage"
      :page-size="pageSize"
      :total_pages="totalPages"
      :users="userStore.users"
    />
  </v-container>
</template>
