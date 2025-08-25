<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Catracas</h1>
        </div>
      </v-col>
    </v-row>

    <!-- Cards de Status -->
    <v-row class="mb-6">
      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="success" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-check-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.online }}</div>
              <div class="text-subtitle-1">Online</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="error" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-close-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.offline }}</div>
              <div class="text-subtitle-1">Offline</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="warning" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-alert-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.warning }}</div>
              <div class="text-subtitle-1">Com Problemas</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="pa-4" color="info" dark>
          <div class="d-flex align-center">
            <v-icon class="mr-4" size="48">mdi-clock</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
              <div class="text-subtitle-1">Total</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <DeviceList
      :devices="devices"
      :loading="loading"
      :syncing="syncing"
      @add="openDeviceDialog()"
      @delete="deleteDevice"
      @edit="editDevice"
      @sync="syncDevices"
      @test="(device) => testConnection(device.id)"
      @toggle-status="toggleDeviceStatus"
      @view="viewDevice"
    />

    <DeviceForm
      v-model="deviceDialog"
      :device="editingDevice"
      :saving="saving"
      @save="saveDevice"
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
  import type { Device } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import DeviceForm from '@/components/devices/DeviceForm.vue'
  import DeviceList from '@/components/devices/DeviceList.vue'
  import { useDevice } from '@/composables/useDevice'

  // Componentes

  // Composables
  const {
    devices,
    loading,
    saving,
    syncing,
    loadDevices,
    createDevice,
    updateDevice,
    deleteDevice: removeDevice,
    testConnection,
    syncDevices,
  } = useDevice()

  // Estado local
  const deviceDialog = ref(false)
  const editingDevice = ref<Device | undefined>()

  // Estatísticas
  const stats = ref({
    online: 0,
    offline: 0,
    warning: 0,
    total: 0,
  })

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos
  const openDeviceDialog = (device?: Device) => {
    editingDevice.value = device
    deviceDialog.value = true
  }

  const editDevice = (device: Device) => {
    openDeviceDialog(device)
  }

  const viewDevice = (device: Device) => {
    // TODO: Implementar visualização detalhada
    console.log('Visualizar dispositivo:', device)
  }

  const saveDevice = async (data: Partial<Device>) => {
    try {
      if (editingDevice.value) {
        await updateDevice(editingDevice.value.id, data)
        showSnackbar('Dispositivo atualizado com sucesso')
      } else {
        await createDevice(data)
        showSnackbar('Dispositivo criado com sucesso')
      }
      deviceDialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar dispositivo', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deleteDevice = async (device: Device) => {
    if (!confirm(`Tem certeza que deseja excluir o dispositivo "${device.name}"?`)) return

    try {
      await removeDevice(device.id)
      showSnackbar('Dispositivo excluído com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir dispositivo', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const toggleDeviceStatus = async (device: Device) => {
    device.updating = true
    try {
      await updateDevice(device.id, { is_active: device.is_active })
      showSnackbar('Status atualizado com sucesso')
    } catch (error: unknown) {
      device.is_active = !device.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      device.updating = false
    }
  }

  // Helpers
  const updateStats = () => {
    const total = devices.value.length
    const online = devices.value.filter(d => d.status === 'online').length
    const offline = devices.value.filter(d => d.status === 'offline').length
    const warning = devices.value.filter(d => d.status === 'warning').length

    stats.value = { total, online, offline, warning }
  }

  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadDevices()
  })
</script>
