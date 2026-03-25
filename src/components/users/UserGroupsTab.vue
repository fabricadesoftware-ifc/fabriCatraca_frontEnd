<script setup lang="ts">
import type { Group } from "@/types";

defineProps<{
  loading: boolean;
  groups: Group[];
  userGroups: number[];
}>();

const emit = defineEmits<{
  (e: "update:userGroups", value: number[]): void;
}>();

function toggleGroup(currentGroups: number[], groupId: number, enabled: boolean) {
  const nextGroups = enabled
    ? Array.from(new Set([...currentGroups, groupId]))
    : currentGroups.filter((currentGroupId) => currentGroupId !== groupId);

  emit("update:userGroups", nextGroups);
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text class="pa-4">
            <v-progress-linear v-if="loading" color="primary" indeterminate />

            <template v-else>
              <div class="text-subtitle-1 mb-4">
                Selecione os grupos aos quais o usuário pertence:
              </div>

              <v-list lines="two">
                <v-list-item v-for="group in groups" :key="group.id" :title="group.name">
                  <template #append>
                    <v-switch
                      color="primary"
                      hide-details
                      :model-value="userGroups.includes(group.id)"
                      @update:model-value="toggleGroup(userGroups, group.id, Boolean($event))"
                    />
                  </template>
                </v-list-item>
              </v-list>

              <div v-if="groups.length === 0" class="text-center pa-4">
                <v-icon class="mb-2" color="grey" icon="mdi-account-group" size="48" />
                <div class="text-body-1 text-grey">Nenhum grupo disponível</div>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
