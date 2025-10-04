<script lang="ts" setup>
  import { ref } from 'vue'
  import importUsersService from '@/services/import_users'

  const props = defineProps<{ modelValue: boolean }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void, (e: 'imported'): void }>()

  const file = ref<File | null>(null)
  const uploading = ref(false)
  const errorMsg = ref<string | null>(null)

  function close () {
    emit('update:modelValue', false)
  }

  function onFileChange (f: File | null | undefined) {
    errorMsg.value = null
    if (!f) {
      file.value = null
      return
    }
    // Valida extensão
    if (!/(xlsx|xls)$/i.test(f.name.split('.').pop() || '')) {
      errorMsg.value = 'Arquivo deve ser .xlsx ou .xls'
      file.value = null
      return
    }
    file.value = f
  }

  async function upload () {
    if (!file.value) return
    try {
      uploading.value = true

      // Criar FormData com o arquivo
      const formData = new FormData()
      formData.append('file', file.value)

      await importUsersService.importUsers(formData)
      emit('imported')
      close()
    } catch (error: any) {
      errorMsg.value = error?.response?.data?.message || 'Falha ao importar arquivo'
    } finally {
      uploading.value = false
    }
  }
</script>

<template>
  <v-dialog max-width="600" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">Importar Usuários</v-card-title>
      <v-card-text>
        <v-alert v-if="errorMsg" class="mb-3" type="error" variant="tonal">{{ errorMsg }}</v-alert>
        <v-file-input
          accept=".xlsx,.xls"
          counter
          density="comfortable"
          label="Selecionar arquivo (.xlsx, .xls)"
          prepend-inner-icon="mdi-file-excel"
          show-size
          variant="outlined"
          @update:model-value="(val: File | File[]) => onFileChange(Array.isArray(val) ? val[0] : (val || null))"
        />
        <div class="text-caption text-grey">Limite recomendado: 100 linhas por arquivo.</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!file" :loading="uploading" @click="upload">Importar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
