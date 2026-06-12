<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { toast } from 'vue3-toastify'
  import DeviceComponent from '@/components/devices/DeviceComponent.vue'
  import { useDeviceStore } from '@/stores/device'

  const deviceStore = useDeviceStore()

  async function pageChanger (page: number) {
    await deviceStore.loadDevices({ page })
  }

  async function itemsPerPageChanger (pageSize: number) {
    await deviceStore.loadDevices({
      page: deviceStore.current_page,
      page_size: pageSize,
    })
  }

  async function handleTestConnection (deviceId: number) {
    try {
      const result = await deviceStore.testConnection(deviceId)
      await deviceStore.loadDevices({
        page: deviceStore.current_page,
        page_size: deviceStore.page_size,
      })
      if (result?.success) {
        toast.success(result.message || 'Conexao estabelecida com sucesso')
      } else {
        toast.warning(result?.message || result?.error || 'Nao foi possivel conectar ao dispositivo')
      }
    } catch (error: any) {
      await deviceStore.loadDevices({
        page: deviceStore.current_page,
        page_size: deviceStore.page_size,
      })
      toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Erro ao testar conexao')
    }
  }

  onMounted(async () => {
    await deviceStore.loadDevices()
  })
</script>

<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-4">Dispositivos</h1>

    <v-divider class="my-4" />

    <DeviceComponent
      :current-page="deviceStore.current_page"
      :devices="deviceStore.devices"
      :page-size="deviceStore.page_size"
      :total-items="deviceStore.count"
      :total-pages="deviceStore.total_pages"
      @item-per-page="itemsPerPageChanger($event)"
      @page-changed="pageChanger($event)"
      @test-connection="handleTestConnection($event)"
    />
  </v-container>
</template>
