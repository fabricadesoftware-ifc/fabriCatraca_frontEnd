<script setup lang="ts">
import { onMounted, ref } from "vue";
import ReleaseAuditTable from "@/components/release-audits/ReleaseAuditTable.vue";
import { useUserStore } from "@/stores";
import { useAuthStore } from "@/stores";

const userStore = useUserStore();
const authStore = useAuthStore();
const userSearch = ref("");
const PAGE_SIZE = 5;

async function pageChanger(page: number | string) {
  const pageNum = typeof page === "number" ? page : Number(page);
  await userStore.loadUsers({
    page: pageNum,
    page_size: 5,
    search: userSearch.value || undefined,
  });
}

async function itemsPerPageChanger(pageSize: number | string) {
  const pageSizeNum = typeof pageSize === "number" ? pageSize : Number(pageSize);
  await userStore.loadUsers({
    page: userStore.current_page,
    page_size: pageSizeNum,
    search: userSearch.value || undefined,
  });
}

async function searchChanged(search: string | number) {
  const searchValue = typeof search === "string" ? search : String(search);
  userSearch.value = searchValue;
  await userStore.loadUsers({
    page: 1, // Voltar para primeira página ao pesquisar
    page_size: userStore.page_size,
    search: searchValue || undefined,
  });
}

onMounted(async () => {
  await userStore.loadUsers({ page_size: 5 });
});

const tab = ref("one");
</script>

<template>
  <v-container class="pa-0" fluid>
    <v-sheet elevation="2">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="one">Usuários</v-tab>
        <v-tab value="two">Histórico de liberações</v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one">
          <v-col md="12">
            <UserComponent
              :app_role="authStore.role"
              :dialog-mode="'release-only'"
              :current-page="userStore.current_page"
              :page-size="5"
              :total-items="userStore.count"
              :total-pages="userStore.total_pages"
              :users="userStore.users"
              @item-per-page="itemsPerPageChanger($event)"
              @page-changed="pageChanger($event)"
              @search-changed="searchChanged($event)"
            />
          </v-col>
        </v-tabs-window-item>
        <v-tabs-window-item value="two">
          <v-col cols="12">
            <ReleaseAuditTable
              title="Histórico de liberações do SISAE"
              :release-types="['scheduled_user_release', 'temporary_user_release']"
            />
          </v-col>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-sheet>
  </v-container>
</template>
