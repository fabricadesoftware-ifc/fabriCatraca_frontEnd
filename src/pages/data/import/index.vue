<script lang="ts" setup>
  import { ref } from 'vue'
  import ImportUsersDialog from '@/components/import/ImportUsersDialog.vue'

  const dialog = ref(false)
  const lastResult = ref<string | null>(null)

  function openDialog () {
    dialog.value = true
  }
  function onImported () {
    lastResult.value = 'Importação concluída com sucesso.'
  }
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Importação de Dados</h1>
    <v-divider class="my-4" />

    <v-card class="pa-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1 mb-1">Importar Usuários</div>
          <div class="text-body-2 text-grey">Envie um arquivo .xlsx/.xls (máx. 100 linhas).</div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-upload" @click="openDialog">Selecionar Arquivo</v-btn>
      </div>
      <v-alert v-if="lastResult" class="mt-4" type="success" variant="tonal">{{ lastResult }}</v-alert>
    </v-card>

    <ImportUsersDialog v-model="dialog" @imported="onImported" />
  </v-container>
</template>

<style scoped>
</style>
