<script lang="ts" setup>
  import { onMounted } from 'vue'
  import AccessRulesComponent from '@/components/access-rules/AccessRulesComponent.vue'
  import { useAccessRuleStore } from '@/stores'

  const store = useAccessRuleStore()
  onMounted(async () => {
    await store.loadAccessRules()
  })
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Regras de Acesso</h1>
    <v-divider class="my-4" />
    <AccessRulesComponent :rules="store.accessRules" />
  </v-container>
</template>

<style scoped>

</style>
