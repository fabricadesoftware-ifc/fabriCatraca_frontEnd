<script setup lang="ts">
import SisaeGroupReleasePanel from "@/components/sisae/SisaeGroupReleasePanel.vue";
import { useAuthStore } from "@/stores";

const authStore = useAuthStore();
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">
      {{ authStore.roleLabel("sisae") }} - Liberacao de Turma
    </h1>
    <v-divider class="my-4" />
    <SisaeGroupReleasePanel />
  </v-container>
</template>
