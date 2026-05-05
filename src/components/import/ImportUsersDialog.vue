<script lang="ts" setup>
  import { ref } from 'vue'
  import importUsersService, { type ImportUsersResult } from '@/services/import_users'

  const props = defineProps<{ modelValue: boolean }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'imported', result: ImportUsersResult): void
  }>()

  const file = ref<File | null>(null)
  const importProfile = ref('tecnico_integrado')
  const uploading = ref(false)
  const errorMsg = ref<string | null>(null)
  const errorDetails = ref<string[]>([])
  const feedbackType = ref<'error' | 'warning'>('error')
  const importProfileOptions = [
    { title: 'Técnico integrado / Ensino médio', value: 'tecnico_integrado' },
    { title: 'Graduação', value: 'graduacao' },
    { title: 'Servidores', value: 'servidores' },
    { title: 'Técnico subsequente', value: 'tecnico_subsequente' },
  ]

  function clearFeedback () {
    errorMsg.value = null
    errorDetails.value = []
    feedbackType.value = 'error'
  }

  function close () {
    emit('update:modelValue', false)
  }

  function formatElapsed (value?: number | null) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null
    return `${value.toFixed(2).replace('.', ',')} s`
  }

  function onFileChange (f: File | null | undefined) {
    clearFeedback()
    if (!f) {
      file.value = null
      return
    }
    // Valida extensão
    if (!/(xlsx|csv)$/i.test(f.name.split('.').pop() || '')) {
      errorMsg.value = 'Arquivo deve ser .xlsx ou .csv'
      file.value = null
      return
    }
    file.value = f
  }

  function buildDetailMessages (result?: ImportUsersResult) {
    const details: string[] = []
    for (const detail of result?.errors || []) {
      if (detail) details.push(`Importação: ${detail}`)
    }
    for (const detail of result?.catraca_errors || []) {
      if (detail) details.push(`Catraca: ${detail}`)
    }
    return details
  }

  async function upload () {
    if (!file.value) return
    try {
      uploading.value = true
      clearFeedback()

      // Criar FormData com o arquivo
      const formData = new FormData()
      formData.append('file', file.value)
      formData.append('import_profile', importProfile.value)

      const result = await importUsersService.importUsers(formData)
      const details = buildDetailMessages(result)
      if (details.length > 0) {
        const elapsed = formatElapsed(result.elapsed_s)
        feedbackType.value = result.success === false ? 'error' : 'warning'
        errorMsg.value = elapsed
          ? `${result.message || 'Importação concluída com pendências.'} Tempo total: ${elapsed}.`
          : result.message || 'Importação concluída com pendências.'
        errorDetails.value = details
        return
      }
      emit('imported', result)
      close()
    } catch (error: any) {
      const responseData = error?.response?.data as ImportUsersResult | undefined
      const message = responseData?.message || responseData?.error || 'Falha ao importar arquivo'
      const elapsed = formatElapsed(responseData?.elapsed_s)
      feedbackType.value = 'error'
      errorMsg.value = elapsed ? `${message} Tempo total: ${elapsed}.` : message
      errorDetails.value = buildDetailMessages(responseData)
    } finally {
      uploading.value = false
    }
  }
</script>

<template>
  <v-dialog max-width="600" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class=" d-flex text-h5 justify-space-between">
        Importar Usuários
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>
      <v-card-text>
        <v-alert v-if="errorMsg" class="mb-3" :type="feedbackType" variant="tonal">
          <div>{{ errorMsg }}</div>
          <ul v-if="errorDetails.length > 0" class="mt-3 pl-5">
            <li v-for="(detail, index) in errorDetails" :key="`${index}-${detail}`">
              {{ detail }}
            </li>
          </ul>
        </v-alert>
        <v-select
          v-model="importProfile"
          :items="importProfileOptions"
          density="comfortable"
          item-title="title"
          item-value="value"
          label="Perfil da importação"
          prepend-inner-icon="mdi-account-school"
          variant="outlined"
        />
        <v-file-input
          accept=".xlsx,.csv"
          counter
          density="comfortable"
          label="Selecionar arquivo (.xlsx, .csv)"
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
