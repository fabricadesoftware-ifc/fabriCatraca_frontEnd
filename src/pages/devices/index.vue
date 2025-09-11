<script lang="ts" setup>
  import { onMounted } from 'vue'
  import DeviceComponent from '@/components/devices/DeviceComponent.vue'
  import router from '@/router'
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
      await deviceStore.testConnection(deviceId)
      router.go(0)
    } catch {
      router.go(0)
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
