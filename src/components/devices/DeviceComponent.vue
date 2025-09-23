<script lang="ts" setup>
  import type { Device } from '@/types'
  import { ref } from 'vue'
  import { useDeviceStore } from '@/stores'
  import DeviceDialog from './DeviceDialog.vue'
  defineProps<{
    devices: Device[]
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
  }>()

  const emit = defineEmits<{
    (e: 'page-changed' | 'item-per-page' | 'test-connection', value: number): void
  }>()

  const dialog = ref(false)
  const selectedDevice = ref<Device | null>(null)
  const creating = ref(false)
  const deviceStore = useDeviceStore()

  const showDeviceDetails = (device: Device) => {
    selectedDevice.value = device
    dialog.value = true
  }

  function novoDispositivo () {
    creating.value = true
    selectedDevice.value = {
      id: 0,
      name: '',
      ip: '',
      username: '',
      is_active: true,
      is_default: false,
    } as Device
    dialog.value = true
  }

  async function salvarDispositivo (device: Device) {
    try {
      const payload = {
        name: device.name,
        ip: device.ip,
        username: device.username,
        is_active: device.is_active,
        is_default: device.is_default,
      }
      device.id === 0
        ? await deviceStore.createDevice(payload)
        : await deviceStore.updateDevice(device.id, payload)
      await deviceStore.loadDevices()
    } catch {
      alert('Erro ao salvar dispositivo')
    } finally {
      creating.value = false
    }
  }

  async function trocarPagina (page: number) {
    emit('page-changed', page)
  }

  async function itemsPerPageChanged (newPageSize: number) {
    emit('item-per-page', newPageSize)
  }

  async function testConnection (deviceId: number) {
    emit('test-connection', deviceId)
  // Corrigido: router.go() requer um argumento delta numérico
  }
</script>

<template>
  <div class="d-flex justify-end mb-4">
    <v-btn color="primary" prepend-icon="mdi-plus" @click="novoDispositivo">Adicionar Dispositivo</v-btn>
  </div>
  <v-data-table-server
    class="rounded-lg"
    :headers="[
      { title: 'ID', key: 'id', align: 'start' },
      { title: 'Nome', key: 'name', align: 'start' },
      { title: 'IP', key: 'ip', align: 'start' },
      { title: 'Status', key: 'status', align: 'start' },
      { title: 'Ações', key: 'actions', align: 'end' }
    ]"
    :items="devices"
    :items-length="totalItems ?? 0"
    :items-per-page="pageSize ?? 10"
    :loading="devices.length === 0"
    :page="currentPage ?? 1"
    @update:items-per-page="itemsPerPageChanged"
    @update:page="trocarPagina"
  >
    <!-- Slot que substitui as linhas -->
    <template #item="{ item }">
      <tr class="cursor-pointer" @click="showDeviceDetails(item)">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.ip }}</td>
        <td>
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            size="small"
            :text="item.is_active ? 'Ativo' : 'Inativo'"
          />
        </td>
        <td class="text-end">
          <v-btn
            class="mr-2"
            color="primary"
            icon
            :loading="item.updating"
            size="small"
            @click.stop="testConnection(item.id)"
          >
            <v-icon>mdi-lan-connect</v-icon>
            <v-tooltip activator="parent">
              Testar Conexão
            </v-tooltip>
          </v-btn>
        </td>
      </tr>
    </template>
  </v-data-table-server>

  <DeviceDialog
    v-model="dialog"
    :device="selectedDevice"
    @save="salvarDispositivo"
  />
  <v-dialog v-model="dialog" max-width="500">
    <v-card v-if="selectedDevice">
      <v-card-title class="text-h5">
        Detalhes do Dispositivo
      </v-card-title>

      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-title>ID:</v-list-item-title>
            <v-list-item-subtitle>{{ selectedDevice.id }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Nome:</v-list-item-title>
            <v-list-item-subtitle>{{ selectedDevice.name }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>IP:</v-list-item-title>
            <v-list-item-subtitle>{{ selectedDevice.ip }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Status:</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                :color="selectedDevice.is_active ? 'success' : 'error'"
                size="small"
                :text="selectedDevice.is_active ? 'Ativo' : 'Inativo'"
              />
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Dispositivo Padrão:</v-list-item-title>
            <v-list-item-subtitle>
              {{ selectedDevice.is_default ? 'Sim' : 'Não' }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Usuário:</v-list-item-title>
            <v-list-item-subtitle>{{ selectedDevice.username }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          variant="text"
          @click="dialog = false"
        >
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: 0.3s ease-in-out;
}

.cursor-pointer:hover {
  background-color: #f5f5f517;
}
</style>
