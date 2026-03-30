<script setup lang="ts">
import { onMounted } from "vue";
import GroupComponent from "@/components/groups/GroupComponent.vue";
import ReleaseAuditTable from "@/components/release-audits/ReleaseAuditTable.vue";
import { useGroupStore, useAuthStore } from "@/stores";

const groupStore = useGroupStore();
const authStore = useAuthStore();

async function pageChanger(page: number | string) {
  const pageNum = typeof page === "number" ? page : Number(page);
  await groupStore.loadGroups({ page: pageNum });
}

async function itemsPerPageChanger(pageSize: number | string) {
  const pageSizeNum = typeof pageSize === "number" ? pageSize : Number(pageSize);
  await groupStore.loadGroups({
    page: groupStore.current_page,
    page_size: pageSizeNum,
  });
}

onMounted(async () => {
  await groupStore.loadGroups();
});
</script>

<template>
  <v-container class="pa-0" fluid>
    <v-row>
      <v-col md="12">
        <GroupComponent
          :app_role="authStore.role"
          :current-page="groupStore.current_page"
          :groups="groupStore.groups"
          :page-size="groupStore.page_size"
          :total-items="groupStore.count"
          :total-pages="groupStore.total_pages"
          @item-per-page="itemsPerPageChanger($event)"
          @page-changed="pageChanger($event)"
        />
      </v-col>

      <v-col cols="12">
        <ReleaseAuditTable
          title="Histórico de liberações de turma"
          :release-types="['temporary_group_release']"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
