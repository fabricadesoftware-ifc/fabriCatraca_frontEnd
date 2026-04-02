<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore, useUserStore } from "@/stores";
import UserComponent from "@/components/users/UserComponent.vue";

const authStore = useAuthStore();
const userStore = useUserStore();
const searchTerm = ref("");

async function loadVisitors(page = 1, pageSize = userStore.page_size) {
  await userStore.loadUsers({
    page,
    page_size: pageSize,
    search: searchTerm.value || undefined,
    user_type_id: 1,
  });
}

async function pageChanger(page: number | string) {
  const pageNum = typeof page === "number" ? page : Number(page);
  await loadVisitors(pageNum, userStore.page_size);
}

async function itemsPerPageChanger(pageSize: number | string) {
  const pageSizeNum = typeof pageSize === "number" ? pageSize : Number(pageSize);
  await loadVisitors(userStore.current_page, pageSizeNum);
}

async function searchChanged(search: string | number) {
  const searchValue = typeof search === "string" ? search : String(search);
  searchTerm.value = searchValue;
  await loadVisitors(1, userStore.page_size);
}

onMounted(async () => {
  await loadVisitors();
});
</script>

<template>
  <UserComponent
    :app_role="authStore.role"
    :can-create="authStore.role === 'admin' || authStore.role === 'guarita'"
    :create-label="'Cadastrar visitante'"
    :current-page="userStore.current_page"
    :custom-headers="[
      { title: 'ID', key: 'id', align: 'start' },
      { title: 'Nome', key: 'name', align: 'start' },
      { title: 'CPF', key: 'cpf', align: 'start' },
      { title: 'E-mail', key: 'email', align: 'start' },
      { title: 'Telefone', key: 'phone', align: 'start' },
    ]"
    :minimal-dialog="true"
    :new-user-defaults="{
      user_type_id: 1,
      device_scope: 'selected',
      selected_device_ids: [],
      selected_devices: [],
      app_role: '',
      panel_access_only: false,
      device_admin: false,
    }"
    :page-size="userStore.page_size"
    :reload-query="{ user_type_id: 1, search: searchTerm || undefined }"
    :title="'Visitantes'"
    :total-items="userStore.count"
    :total-pages="userStore.total_pages"
    :users="userStore.users"
    @item-per-page="itemsPerPageChanger($event)"
    @page-changed="pageChanger($event)"
    @search-changed="searchChanged($event)"
  />
</template>
