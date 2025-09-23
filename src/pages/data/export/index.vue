<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import ExportUsersDialog from '@/components/export/ExportUsersDialog.vue'
  import { useGroupStore } from '@/stores'

  const groupStore = useGroupStore()
  const dialog = ref(false)
  const lastResult = ref<string | null>(null)

  function openDialog () {
    dialog.value = true
  }

  function onExported () {
    lastResult.value = 'Exportação concluída com sucesso.'
  }

  onMounted(async () => {
    await groupStore.loadGroups()
  })
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Exportação de Dados</h1>
    <v-divider class="my-4" />

    <v-card class="pa-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1 mb-1">Exportar Usuários</div>
          <div class="text-body-2 text-grey">Exporte usuários por grupo em diferentes formatos.</div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-download" @click="openDialog">Exportar Usuários</v-btn>
      </div>
      <v-alert v-if="lastResult" class="mt-4" type="success" variant="tonal">{{ lastResult }}</v-alert>
    </v-card>

    <ExportUsersDialog v-model="dialog" @exported="onExported" />
  </v-container>
</template>
