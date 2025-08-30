<script lang="ts" setup>
  defineProps<{
    title: string
    description: string
    value: string
  }>()

</script>

<template>
  <v-card
    class="pa-4"
    color="white"
    rounded="lg"
    variant="flat"
  >
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>
      <p>{{ description }}</p>
      <p>{{ value }}</p>
    </v-card-text>
  </v-card>
</template>
