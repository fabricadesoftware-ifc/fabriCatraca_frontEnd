<script setup lang="ts">
import GuaritaOperationsPanel from "@/components/guarita/GuaritaOperationsPanel.vue";
import { useAuthStore } from "@/stores";

const authStore = useAuthStore();
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">{{ authStore.roleLabel("guarita") }}</h1>
    <v-divider class="my-4" />
    <GuaritaOperationsPanel />
  </v-container>
</template>
