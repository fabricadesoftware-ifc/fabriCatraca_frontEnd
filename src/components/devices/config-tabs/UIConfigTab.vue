<script setup lang="ts">
  import type { UIConfig } from '@/types'

  defineProps<{
    config: UIConfig | null
    saving: boolean
  }>()
</script>

<template>
  <v-container>
    <v-alert
      border="start"
      density="comfortable"
      type="info"
      variant="tonal"
    >
      Nenhuma configuração de interface está disponível para este firmware.
    </v-alert>
  </v-container>
</template>
