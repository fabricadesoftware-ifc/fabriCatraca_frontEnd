<script setup lang="ts">
  import type { Device, DeviceRegistryReport, DeviceRegistryRow } from '@/types'
  import { computed, ref, watch } from 'vue'
  import { toast } from 'vue3-toastify'
  import { DeviceService } from '@/services'

  const props = defineProps<{
    modelValue: boolean
    device: Device | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const loading = ref(false)
  const syncing = ref(false)
  const report = ref<DeviceRegistryReport | null>(null)

  const statusColors: Record<string, string> = {
    ok: 'success',
    divergente: 'warning',
    faltando: 'error',
    extra: 'info',
  }

  const rows = computed(() => report.value?.rows ?? [])

  watch(
    () => props.modelValue,
    async isOpen => {
      if (isOpen && props.device?.id) {
        await loadRegistry()
      }
    },
  )

  async function loadRegistry () {
    if (!props.device?.id) {
      return
    }
    loading.value = true
    try {
      report.value = await DeviceService.getRegistry(props.device.id)
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erro ao carregar registry remoto'
      toast.error(message)
    } finally {
      loading.value = false
    }
  }

  async function syncRegistry () {
    if (!props.device?.id) {
      return
    }
    syncing.value = true
    try {
      await DeviceService.syncRegistry(props.device.id)
      toast.success('Registry sincronizado com sucesso!')
      await loadRegistry()
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erro ao sincronizar registry'
      toast.error(message)
    } finally {
      syncing.value = false
    }
  }

  function close () {
    emit('update:modelValue', false)
  }

  function statusColor (status: string) {
    return statusColors[status] || 'default'
  }

  function deviceLabel (item?: DeviceRegistryRow['expected'] | DeviceRegistryRow['remote'] | null) {
    if (!item) {
      return '-'
    }
    return `${item.name} (${item.ip})`
  }
</script>

<template>
  <v-dialog
    max-width="1000px"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5">
          <v-icon class="mr-2">mdi-database-search</v-icon>
          Conferir Registry Remoto
        </span>
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-card-subtitle v-if="device">
        {{ device.name }} - {{ device.ip }}
      </v-card-subtitle>

      <v-divider />

      <v-card-text>
        <div class="d-flex flex-wrap ga-3 mb-4">
          <v-chip color="primary" variant="tonal">
            Esperados: {{ report?.expected_count ?? 0 }}
          </v-chip>
          <v-chip color="secondary" variant="tonal">
            Remotos: {{ report?.remote_count ?? 0 }}
          </v-chip>
          <v-chip color="success" variant="tonal">
            OK: {{ rows.filter(row => row.status === 'ok').length }}
          </v-chip>
          <v-chip color="warning" variant="tonal">
            Divergentes: {{ rows.filter(row => row.status === 'divergente').length }}
          </v-chip>
          <v-chip color="error" variant="tonal">
            Faltando: {{ rows.filter(row => row.status === 'faltando').length }}
          </v-chip>
          <v-chip color="info" variant="tonal">
            Extras: {{ rows.filter(row => row.status === 'extra').length }}
          </v-chip>
        </div>

        <v-alert class="mb-4" type="info" variant="tonal">
          Esta tela mostra o que deveria existir na tabela `devices` da catraca comparado ao que esta cadastrado nela agora.
        </v-alert>

        <v-data-table
          :headers="[
            { title: 'ID', key: 'id' },
            { title: 'Status', key: 'status' },
            { title: 'Esperado', key: 'expected' },
            { title: 'Remoto', key: 'remote' },
          ]"
          :items="rows"
          :loading="loading"
          items-per-page="10"
        >
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="flat">
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.expected="{ item }">
            {{ deviceLabel(item.expected) }}
          </template>

          <template #item.remote="{ item }">
            {{ deviceLabel(item.remote) }}
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="loadRegistry">
          Atualizar
        </v-btn>
        <v-btn color="primary" :loading="syncing" @click="syncRegistry">
          Sincronizar nesta catraca
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
