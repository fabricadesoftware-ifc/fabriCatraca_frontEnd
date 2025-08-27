<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Horários</h1>
        </div>
      </v-col>
    </v-row>

    <TimeZoneList
      :loading="loading"
      :time-zones="timeZones"
      @add="openTimeZoneDialog()"
      @delete="deleteTimeZone"
      @edit="editTimeZone"
      @manage-spans="openTimeSpanList"
    />

    <TimeZoneForm
      v-model="timeZoneDialog"
      :saving="saving"
      :time-zone="editingTimeZone"
      @save="saveTimeZone"
    />

    <TimeSpanList
      v-model="timeSpanListDialog"
      :loading="loadingTimeSpans"
      :time-zone="selectedTimeZone || undefined"
      @add-span="openTimeSpanDialog()"
      @delete-span="deleteTimeSpan"
      @edit-span="editTimeSpan"
    />

    <TimeSpanForm
      v-model="timeSpanDialog"
      :saving="saving"
      :time-span="editingTimeSpan"
      @save="saveTimeSpan"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { TimeSpan, TimeZone } from '@/types'
  import { onMounted, reactive, ref } from 'vue'

  import TimeSpanForm from '@/components/time-zones/TimeSpanForm.vue'
  import TimeSpanList from '@/components/time-zones/TimeSpanList.vue'
  import TimeZoneForm from '@/components/time-zones/TimeZoneForm.vue'
  import TimeZoneList from '@/components/time-zones/TimeZoneList.vue'
  import { useTimeZone } from '@/composables/useTimeZone'

  // Composable
  const {
    timeZones,
    selectedTimeZone,
    loading,
    saving,
    loadingTimeSpans,
    loadTimeZones,
    createTimeZone,
    updateTimeZone,
    deleteTimeZone: removeTimeZone,
    createTimeSpan,
    updateTimeSpan,
    deleteTimeSpan: removeTimeSpan,
  } = useTimeZone()

  // Estado local
  const timeZoneDialog = ref(false)
  const timeSpanDialog = ref(false)
  const timeSpanListDialog = ref(false)
  const editingTimeZone = ref<TimeZone | undefined>()
  const editingTimeSpan = ref<TimeSpan | undefined>()

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos - TimeZone
  const openTimeZoneDialog = (timeZone?: TimeZone) => {
    editingTimeZone.value = timeZone
    timeZoneDialog.value = true
  }

  const editTimeZone = (timeZone: TimeZone) => {
    openTimeZoneDialog(timeZone)
  }

  const saveTimeZone = async (data: Partial<TimeZone>) => {
    try {
      if (editingTimeZone.value) {
        await updateTimeZone(editingTimeZone.value.id, data)
        showSnackbar('Fuso horário atualizado com sucesso')
      } else {
        await createTimeZone(data)
        showSnackbar('Fuso horário criado com sucesso')
      }
      timeZoneDialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar fuso horário', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deleteTimeZone = async (timeZone: TimeZone) => {
    if (!confirm(`Tem certeza que deseja excluir o fuso horário "${timeZone.name}"?`)) return

    try {
      await removeTimeZone(timeZone.id)
      showSnackbar('Fuso horário excluído com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir fuso horário', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  // Métodos - TimeSpan
  const openTimeSpanList = (timeZone: TimeZone) => {
    selectedTimeZone.value = timeZone
    timeSpanListDialog.value = true
  }

  const openTimeSpanDialog = (timeSpan?: TimeSpan) => {
    editingTimeSpan.value = timeSpan
    timeSpanDialog.value = true
  }

  const editTimeSpan = (timeSpan: TimeSpan) => {
    openTimeSpanDialog(timeSpan)
  }

  const saveTimeSpan = async (data: Partial<TimeSpan>) => {
    try {
      if (editingTimeSpan.value) {
        await updateTimeSpan(editingTimeSpan.value.id, data)
        showSnackbar('Período atualizado com sucesso')
      } else if (selectedTimeZone.value) {
        await createTimeSpan({ ...data, time_zone: selectedTimeZone.value })
        showSnackbar('Período criado com sucesso')
      }
      timeSpanDialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar período', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deleteTimeSpan = async (timeSpan: TimeSpan) => {
    if (!confirm('Tem certeza que deseja excluir este período?')) return

    try {
      await removeTimeSpan(timeSpan.id)
      showSnackbar('Período excluído com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir período', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  // Helpers
  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadTimeZones()
  })
</script>
