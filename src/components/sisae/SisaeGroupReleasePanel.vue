<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Group } from "@/types";
import ReleaseAuditTable from "@/components/release-audits/ReleaseAuditTable.vue";
import GroupTemporaryReleasePanel from "@/components/groups/GroupTemporaryReleasePanel.vue";
import { useGroupStore } from "@/stores";
import { useAuthStore } from "@/stores";

const groupStore = useGroupStore();
const authStore = useAuthStore();
const groupSearch = ref("");
const selectedGroup = ref<Group | null>(null);
const releaseDialog = ref(false);

const headers = [
  { title: "ID", key: "id", align: "start" as const },
  { title: "Turma", key: "name", align: "start" as const },
  { title: "Usuários", key: "users", align: "start" as const },
];

async function pageChanger(page: number | string) {
  const pageNum = typeof page === "number" ? page : Number(page);
  await groupStore.loadGroups({
    page: pageNum,
    search: groupSearch.value || undefined,
  });
}

async function itemsPerPageChanger(pageSize: number | string) {
  const pageSizeNum = typeof pageSize === "number" ? pageSize : Number(pageSize);
  await groupStore.loadGroups({
    page: groupStore.current_page,
    page_size: pageSizeNum,
    search: groupSearch.value || undefined,
  });
}

async function searchChanged(search: string | number) {
  const searchValue = typeof search === "string" ? search : String(search);
  groupSearch.value = searchValue;
  await groupStore.loadGroups({
    page: 1,
    page_size: groupStore.page_size,
    search: searchValue || undefined,
  });
}

function openGroupRelease(_event: Event, { item }: { item: Group }) {
  selectedGroup.value = item;
  releaseDialog.value = true;
}

onMounted(async () => {
  await groupStore.loadGroups();
});
</script>

<template>
  <v-container class="pa-0" fluid>
    <v-row>
      <v-col cols="12">
        <!-- Search bar -->
        <v-text-field
          v-model="groupSearch"
          append-inner-icon="mdi-magnify"
          class="mb-4"
          clearable
          density="comfortable"
          hide-details
          label="Pesquisar turma por nome"
          single-line
          variant="outlined"
          @update:model-value="searchChanged($event)"
        />

        <!-- Group table -->
        <v-data-table-server
          class="rounded-lg"
          :headers="headers"
          hover
          item-key="id"
          :items="groupStore.groups"
          :items-length="groupStore.count ?? 0"
          :items-per-page="groupStore.page_size ?? 10"
          :loading="groupStore.loading"
          :page="groupStore.current_page ?? 1"
          return-object
          @click:row="openGroupRelease"
          @update:items-per-page="itemsPerPageChanger($event)"
          @update:page="pageChanger($event)"
        >
          <template #item.users="{ item }">
            {{ item.users?.length || 0 }} usuário(s)
          </template>
        </v-data-table-server>
      </v-col>

      <v-col cols="12">
        <ReleaseAuditTable
          title="Histórico de liberações de turma"
          :release-types="['temporary_group_release']"
        />
      </v-col>
    </v-row>

    <!-- Release dialog -->
    <v-dialog v-model="releaseDialog" max-width="800" scrollable>
      <v-card v-if="selectedGroup">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
          Liberação Temporária — {{ selectedGroup.name }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-0">
          <GroupTemporaryReleasePanel :group-id="selectedGroup.id" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="releaseDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
