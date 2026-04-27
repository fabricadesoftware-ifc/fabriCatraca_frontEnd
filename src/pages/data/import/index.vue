<script lang="ts" setup>
  import { ref } from 'vue'
  import ImportUsersDialog from '@/components/import/ImportUsersDialog.vue'
  import type { ImportUsersResult } from '@/services/import_users'

  const dialog = ref(false)
  const lastResult = ref<{ message: string, elapsed: string | null } | null>(null)

  function openDialog () {
    dialog.value = true
  }

  function formatElapsed (value?: number | null) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null
    return `${value.toFixed(2).replace('.', ',')} s`
  }

  function onImported (result: ImportUsersResult) {
    lastResult.value = {
      message: result.message || 'Importação concluída com sucesso.',
      elapsed: formatElapsed(result.elapsed_s),
    }
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
      <v-alert v-if="lastResult" class="mt-4" type="success" variant="tonal">
        <div>{{ lastResult.message }}</div>
        <div v-if="lastResult.elapsed" class="text-caption mt-1">Tempo total: {{ lastResult.elapsed }}</div>
      </v-alert>
    </v-card>

    <ImportUsersDialog v-model="dialog" @imported="onImported" />
  </v-container>
</template>

<style scoped>
</style>
