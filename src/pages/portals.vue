<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Portais</h1>
        </div>
      </v-col>
    </v-row>

    <PortalList
      :loading="loading"
      :portals="portals"
      @add="openPortalDialog()"
      @delete="deletePortal"
      @edit="editPortal"
      @manage-devices="openDeviceList"
      @manage-rules="manageAccessRules"
      @toggle-status="togglePortalStatus"
      @view="viewDetails"
    />

    <PortalDeviceList
      v-model="deviceListDialog"
      :loading="loadingDevices"
      :portal="selectedPortal || undefined"
      @add-device="openDeviceDialog()"
      @remove-device="removeDevice"
    />

    <v-dialog
      v-model="deviceDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Adicionar Dispositivo ao Portal
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="selectedDevice"
            item-title="name"
            item-value="id"
            :items="availableDevices"
            label="Selecionar Dispositivo"
            :loading="loadingAvailableDevices"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="deviceDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!selectedDevice"
            @click="addDevice"
          >
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="detailsDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Detalhes do Portal: {{ selectedPortal?.name }}
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Nome</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPortal?.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tipo</v-list-item-title>
              <v-list-item-subtitle>{{ getPortalTypeLabel(selectedPortal?.type || '') }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="selectedPortal?.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ selectedPortal?.is_active ? 'Ativo' : 'Inativo' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedPortal?.description">
              <v-list-item-title>Descrição</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPortal.description }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedPortal?.area">
              <v-list-item-title>Área</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPortal.area.name }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="detailsDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  import type { Device, Portal } from '@/types'
  import { onMounted, reactive, ref } from 'vue'

  import PortalDeviceList from '@/components/portals/PortalDeviceList.vue'
  import PortalList from '@/components/portals/PortalList.vue'
  import { useDevice } from '@/composables/useDevice'
  import { usePortal } from '@/composables/usePortal'
  import portalsService from '@/services/portals'

  // Composables
  const {
    portals,
    selectedPortal,
    loading,
    loadPortals,
    createPortal,
    updatePortal,
    deletePortal: removePortal,
    getPortalTypeLabel,
  } = usePortal()

  const {
    devices: availableDevices,
    loading: loadingAvailableDevices,
    loadDevices,
  } = useDevice()

  // Estado local
  const portalDialog = ref(false)
  const deviceDialog = ref(false)
  const deviceListDialog = ref(false)
  const detailsDialog = ref(false)
  const editingPortal = ref<Portal | undefined>()
  const selectedDevice = ref<number | null>(null)
  const loadingDevices = ref(false)

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos
  const openPortalDialog = (portal?: Portal) => {
    editingPortal.value = portal
    portalDialog.value = true
  }

  const editPortal = (portal: Portal) => {
    openPortalDialog(portal)
  }

  const savePortal = async (data: Partial<Portal>) => {
    try {
      if (editingPortal.value) {
        await updatePortal(editingPortal.value.id, data)
        showSnackbar('Portal atualizado com sucesso')
      } else {
        await createPortal(data)
        showSnackbar('Portal criado com sucesso')
      }
      portalDialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar portal', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deletePortal = async (portal: Portal) => {
    if (!confirm(`Tem certeza que deseja excluir o portal "${portal.name}"?`)) return

    try {
      await removePortal(portal.id)
      showSnackbar('Portal excluído com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir portal', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const togglePortalStatus = async (portal: Portal) => {
    portal.updating = true
    try {
      await updatePortal(portal.id, { is_active: portal.is_active })
      showSnackbar('Status atualizado com sucesso')
    } catch (error: unknown) {
      portal.is_active = !portal.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      portal.updating = false
    }
  }

  const viewDetails = (portal: Portal) => {
    selectedPortal.value = portal
    detailsDialog.value = true
  }

  const openDeviceList = (portal: Portal) => {
    selectedPortal.value = portal
    deviceListDialog.value = true
  }

  const openDeviceDialog = async () => {
    await loadDevices()
    selectedDevice.value = null
    deviceDialog.value = true
  }

  const addDevice = async () => {
    if (!selectedDevice.value || !selectedPortal.value) return

    try {
      // TODO: Implementar adição de dispositivo ao portal
      showSnackbar('Dispositivo adicionado ao portal')
      deviceDialog.value = false
      // Recarregar portal
      const response = await portalsService.getPortalById(selectedPortal.value.id)
      selectedPortal.value = response.data
    } catch (error: unknown) {
      showSnackbar('Erro ao adicionar dispositivo', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const removeDevice = async (device: Device) => {
    if (!selectedPortal.value) return

    if (!confirm(`Tem certeza que deseja remover o dispositivo "${device.name}"?`)) return

    try {
      // TODO: Implementar remoção de dispositivo do portal
      showSnackbar('Dispositivo removido do portal')
      // Recarregar portal
      const response = await portalsService.getPortalById(selectedPortal.value.id)
      selectedPortal.value = response.data
    } catch (error: unknown) {
      showSnackbar('Erro ao remover dispositivo', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const manageAccessRules = (_portal: Portal) => {
    // TODO: Implementar gerenciamento de regras de acesso
    showSnackbar('Funcionalidade em desenvolvimento')
  }

  // Helpers
  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadPortals()
  })
</script>
