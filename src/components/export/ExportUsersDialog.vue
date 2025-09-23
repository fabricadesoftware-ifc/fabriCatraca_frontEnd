<script lang="ts" setup>
  import { ref } from 'vue'
  import { useGroupStore } from '@/stores'
  import { useExportUserStore } from '@/stores/exportUser'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'exported'): void
  }>()

  const exportStore = useExportUserStore()
  const groupStore = useGroupStore()
  const selectedGroup = ref<number | null>(null)
  const fileType = ref<'csv' | 'txt' | 'xlsx'>('csv')
  const loading = ref(false)

  const fileTypes = [
    { title: 'CSV', value: 'csv' },
    { title: 'Excel (XLSX)', value: 'xlsx' },
  ]

  function close () {
    emit('update:modelValue', false)
  }

  async function exportar () {
    if (!selectedGroup.value) return

    loading.value = true
    try {
      await exportStore.exportUsers(selectedGroup.value, fileType.value)
      emit('exported')
      close()
    } catch (error) {
      console.error('Erro ao exportar:', error)
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <v-dialog max-width="500" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">Exportar Usuários</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedGroup"
          class="mb-4"
          density="comfortable"
          item-title="name"
          item-value="id"
          :items="groupStore.groups"
          label="Selecione o Grupo"
          variant="outlined"
        />

        <v-select
          v-model="fileType"
          density="comfortable"
          item-title="title"
          item-value="value"
          :items="fileTypes"
          label="Formato do Arquivo"
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn
          color="primary"
          :disabled="!selectedGroup"
          :loading="loading"
          @click="exportar"
        >
          Exportar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
