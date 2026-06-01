<script setup lang="ts">
import SisaeReleasePanel from "@/components/sisae/SisaeReleasePanel.vue";
import { useAuthStore } from "@/stores";

const authStore = useAuthStore();
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">{{ authStore.roleLabel("sisae") }}</h1>
    <v-divider class="my-4" />
    <SisaeReleasePanel />
  </v-container>
</template>
