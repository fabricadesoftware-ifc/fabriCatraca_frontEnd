<script setup lang="ts">
  import type { Device } from '@/types'
  import { storeToRefs } from 'pinia'
  import { ref, watch } from 'vue'
  import { useDeviceConfig } from '@/composables/useDeviceConfig'
  import { useControlIdConfigStore } from '@/stores'

  import CatraConfigTab from './config-tabs/CatraConfigTab.vue'
  import HardwareConfigTab from './config-tabs/HardwareConfigTab.vue'
  import MonitorConfigTab from './config-tabs/MonitorConfigTab.vue'
  import PushServerConfigTab from './config-tabs/PushServerConfigTab.vue'
  import SecurityConfigTab from './config-tabs/SecurityConfigTab.vue'
  import SystemConfigTab from './config-tabs/SystemConfigTab.vue'
  import UIConfigTab from './config-tabs/UIConfigTab.vue'

  const props = defineProps<{
    modelValue: boolean
    device: Device | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
  }>()

  const configStore = useControlIdConfigStore()
  const {
    systemConfig,
    hardwareConfig,
    securityConfig,
    uiConfig,
    catraConfig,
    pushServerConfig,
    monitorConfig,
  } = storeToRefs(configStore)

  const tab = ref('system')

  const {
    saving,
    activating,
    loadConfigs,
    saveSystemConfig,
    saveHardwareConfig,
    saveSecurityConfig,
    saveUIConfig,
    saveCatraConfig,
    savePushServerConfig,
    saveMonitorConfig,
    activateMonitor,
  } = useDeviceConfig(() => props.device)

  watch(
    () => props.modelValue,
    async isOpen => {
      if (isOpen && props.device) {
        await loadConfigs()
      }
    },
  )

  async function handleSaveSystem (data: any) {
    await saveSystemConfig(data)
    emit('saved')
  }

  async function handleSaveHardware (data: any) {
    await saveHardwareConfig(data)
    emit('saved')
  }

  async function handleSaveSecurity (data: any) {
    await saveSecurityConfig(data)
    emit('saved')
  }

  async function handleSaveUI (data: any) {
    await saveUIConfig(data)
    emit('saved')
  }

  async function handleSaveCatra (data: any) {
    await saveCatraConfig(data)
    emit('saved')
  }

  async function handleSavePushServer (data: any) {
    await savePushServerConfig(data)
    emit('saved')
  }

  async function handleSaveMonitor (data: any) {
    await saveMonitorConfig(data)
    emit('saved')
  }

  async function handleActivateMonitor (formData: any) {
    await activateMonitor(formData)
  }

  function close () {
    emit('update:modelValue', false)
  }
</script>

<template>
  <v-dialog
    max-width="1200px"
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5">
          <v-icon class="mr-2"> mdi-cog </v-icon>
          Configurações da Catraca
        </span>
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-card-subtitle v-if="device">
        {{ device.name }} - {{ device.ip }}
      </v-card-subtitle>

      <v-divider />

      <v-card-text style="max-height: 70vh; overflow-y: auto">
        <v-tabs v-model="tab" color="primary">
          <v-tab value="system">
            <v-icon class="mr-2"> mdi-application-cog </v-icon>
            Sistema
          </v-tab>
          <v-tab value="hardware">
            <v-icon class="mr-2"> mdi-chip </v-icon>
            Hardware
          </v-tab>
          <v-tab value="security">
            <v-icon class="mr-2"> mdi-shield-lock </v-icon>
            Segurança
          </v-tab>
          <v-tab value="ui">
            <v-icon class="mr-2"> mdi-monitor </v-icon>
            Interface
          </v-tab>
          <v-tab value="catra">
            <v-icon class="mr-2"> mdi-turnstile </v-icon>
            Catraca
          </v-tab>
          <v-tab value="push">
            <v-icon class="mr-2"> mdi-server-network </v-icon>
            Push Server
          </v-tab>
          <v-tab value="monitor">
            <v-icon class="mr-2"> mdi-monitor-eye </v-icon>
            Monitor
          </v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-4">
          <v-window-item value="system">
            <SystemConfigTab
              :config="systemConfig"
              :saving="saving"
              @save="handleSaveSystem"
            />
          </v-window-item>

          <v-window-item value="hardware">
            <HardwareConfigTab
              :config="hardwareConfig"
              :saving="saving"
              @save="handleSaveHardware"
            />
          </v-window-item>

          <v-window-item value="security">
            <SecurityConfigTab
              :config="securityConfig"
              :saving="saving"
              @save="handleSaveSecurity"
            />
          </v-window-item>

          <v-window-item value="ui">
            <UIConfigTab
              :config="uiConfig"
              :saving="saving"
              @save="handleSaveUI"
            />
          </v-window-item>

          <v-window-item value="catra">
            <CatraConfigTab
              :config="catraConfig"
              :saving="saving"
              @save="handleSaveCatra"
            />
          </v-window-item>

          <v-window-item value="push">
            <PushServerConfigTab
              :config="pushServerConfig"
              :saving="saving"
              @save="handleSavePushServer"
            />
          </v-window-item>

          <v-window-item value="monitor">
            <MonitorConfigTab
              :activating="activating"
              :config="monitorConfig"
              :saving="saving"
              @activate="handleActivateMonitor"
              @save="handleSaveMonitor"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
