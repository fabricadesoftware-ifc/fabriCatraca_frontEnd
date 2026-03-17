<script setup lang="ts">
  import type { Device, DeviceLogoSlot, DeviceLogoSummary } from '@/types'
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { toast } from 'vue3-toastify'
  import { DeviceService } from '@/services'

  const props = defineProps<{
    device: Device | null
    active: boolean
  }>()

  const loading = ref(false)
  const processingSlotId = ref<number | null>(null)
  const summary = ref<DeviceLogoSummary | null>(null)
  const fileInput = ref<HTMLInputElement | null>(null)
  const pendingUploadSlotId = ref<number | null>(null)
  const previewUrls = ref<Record<number, string>>({})

  const slots = computed(() => summary.value?.slots ?? [])

  watch(
    () => [props.device?.id, props.active],
    async ([deviceId, active]) => {
      if (deviceId && active) {
        await loadSummary()
      } else if (!deviceId) {
        summary.value = null
        clearPreviewUrls()
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    clearPreviewUrls()
  })

  async function loadSummary () {
    if (!props.device?.id) {
      return
    }
    loading.value = true
    try {
      summary.value = await DeviceService.getLogoSummary(props.device.id)
      await loadPreviews(summary.value)
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erro ao carregar logos da catraca'
      toast.error(message)
    } finally {
      loading.value = false
    }
  }

  async function loadPreviews (logoSummary: DeviceLogoSummary) {
    const nextUrls: Record<number, string> = {}
    const slotsWithLogo = logoSummary.slots.filter(slot => slot.has_logo)
    await Promise.all(
      slotsWithLogo.map(async slot => {
        try {
          const blob = await DeviceService.getLogoImage(logoSummary.device_id, slot.slot_id)
          nextUrls[slot.slot_id] = URL.createObjectURL(blob)
        } catch {
          nextUrls[slot.slot_id] = ''
        }
      }),
    )
    clearPreviewUrls()
    previewUrls.value = nextUrls
  }

  function clearPreviewUrls () {
    Object.values(previewUrls.value).forEach(url => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    })
    previewUrls.value = {}
  }

  function isProcessing (slotId: number) {
    return processingSlotId.value === slotId
  }

  function previewUrl (slotId: number) {
    return previewUrls.value[slotId] || ''
  }

  function openFilePicker (slotId: number) {
    pendingUploadSlotId.value = slotId
    fileInput.value?.click()
  }

  async function handleFileSelected (event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    const slotId = pendingUploadSlotId.value
    target.value = ''

    if (!file || !slotId || !props.device?.id) {
      return
    }
    if (file.type !== 'image/png') {
      toast.error('Envie um arquivo PNG')
      return
    }

    processingSlotId.value = slotId
    try {
      await DeviceService.uploadLogo(props.device.id, slotId, file)
      toast.success(`Logo enviado para o slot ${slotId}!`)
      await loadSummary()
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erro ao enviar logo'
      toast.error(message)
    } finally {
      processingSlotId.value = null
      pendingUploadSlotId.value = null
    }
  }

  async function removeLogo (slotId: number) {
    if (!props.device?.id) {
      return
    }
    processingSlotId.value = slotId
    try {
      await DeviceService.deleteLogo(props.device.id, slotId)
      toast.success(`Logo removido do slot ${slotId}!`)
      await loadSummary()
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erro ao remover logo'
      toast.error(message)
    } finally {
      processingSlotId.value = null
    }
  }

  async function activateLogo (slotId: number) {
    if (!props.device?.id) {
      return
    }
    processingSlotId.value = slotId
    try {
      await DeviceService.showLogo(props.device.id, slotId)
      toast.success(`Slot ${slotId} definido como logo visivel!`)
      await loadSummary()
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erro ao ativar logo'
      toast.error(message)
    } finally {
      processingSlotId.value = null
    }
  }

  async function hideLogo () {
    if (!props.device?.id) {
      return
    }
    processingSlotId.value = 0
    try {
      await DeviceService.showLogo(props.device.id, 0)
      toast.success('Exibicao de logo desativada!')
      await loadSummary()
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Erro ao ocultar logo'
      toast.error(message)
    } finally {
      processingSlotId.value = null
    }
  }

  function activeLabel (slot: DeviceLogoSlot) {
    return slot.is_active ? 'Visivel agora' : 'Nao visivel'
  }
</script>

<template>
  <v-container>
    <input
      ref="fileInput"
      accept="image/png"
      class="d-none"
      type="file"
      @change="handleFileSelected"
    >

    <v-alert class="mb-4" type="info" variant="tonal">
      A catraca suporta ate 8 logos. O arquivo precisa ser PNG e ter no maximo 1MB.
    </v-alert>

    <div class="d-flex flex-wrap ga-3 mb-4">
      <v-chip color="primary" variant="tonal">
        Slot ativo: {{ summary?.active_slot ?? 0 }}
      </v-chip>
      <v-btn size="small" variant="text" :loading="loading" @click="loadSummary">
        Atualizar logos
      </v-btn>
      <v-btn size="small" variant="text" :loading="processingSlotId === 0" @click="hideLogo">
        Ocultar logo
      </v-btn>
    </div>

    <v-row>
      <v-col
        v-for="slot in slots"
        :key="slot.slot_id"
        cols="12"
        md="6"
        lg="3"
      >
        <v-card :loading="loading || isProcessing(slot.slot_id)" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Slot {{ slot.slot_id }}</span>
            <v-chip
              :color="slot.is_active ? 'success' : 'default'"
              size="small"
              variant="tonal"
            >
              {{ activeLabel(slot) }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div
              class="border rounded d-flex align-center justify-center mb-3 bg-grey-lighten-4"
              style="height: 180px;"
            >
              <v-img
                v-if="slot.has_logo && previewUrl(slot.slot_id)"
                :src="previewUrl(slot.slot_id)"
                contain
                height="160"
              />
              <span v-else class="text-medium-emphasis">Sem logo</span>
            </div>

            <div class="text-caption text-medium-emphasis">
              {{ slot.has_logo ? 'Logo carregado neste slot' : 'Nenhum logo gravado neste slot' }}
            </div>
          </v-card-text>

          <v-card-actions class="flex-wrap ga-2 px-4 pb-4">
            <v-btn
              color="primary"
              size="small"
              variant="tonal"
              @click="openFilePicker(slot.slot_id)"
            >
              Enviar PNG
            </v-btn>
            <v-btn
              color="success"
              :disabled="!slot.has_logo"
              size="small"
              variant="tonal"
              @click="activateLogo(slot.slot_id)"
            >
              Exibir
            </v-btn>
            <v-btn
              color="error"
              :disabled="!slot.has_logo"
              size="small"
              variant="tonal"
              @click="removeLogo(slot.slot_id)"
            >
              Remover
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
