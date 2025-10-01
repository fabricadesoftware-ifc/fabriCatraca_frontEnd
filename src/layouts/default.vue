<script setup>
  import AllPages from './allPages.vue'

  const route = useRoute()
</script>
<template>
  <div v-if="route.path === '/login/' || route.path === '/login'">
    <router-view />
  </div>
  <div v-else>
    <AllPages />
  </div>
</template>
