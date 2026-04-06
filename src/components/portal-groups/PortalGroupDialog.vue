<script lang="ts" setup>
  import { ref, watch, computed } from 'vue'
  import type { PortalGroup, PortalGroupCreate } from '@/types/portal-groups'
  import { useDeviceStore } from '@/stores'

  const props = defineProps<{
    modelValue: boolean
    portalGroup?: Partial<PortalGroup>
  }>()

  const tab = ref('dados')
  const name = ref('')
  const description = ref('')
  const is_active = ref(true)
  const selectedDeviceIds = ref<number[]>([])

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', value: Partial<PortalGroup & { device_ids?: number[] }>): void
  }>()

  const deviceStore = useDeviceStore()
  const allDevices = computed(() => deviceStore.devices || [])

  async function salvar () {
    const data: Partial<PortalGroup & { device_ids?: number[] }> = {
      name: name.value,
      description: description.value,
      is_active: is_active.value,
      device_ids: selectedDeviceIds.value,
    }
    if (props.portalGroup?.id) {
      ;(data as any).id = props.portalGroup.id
    }
    emit('save', data)
    closeDialog()
  }

  function closeDialog () {
    emit('update:modelValue', false)
  }

  watch(
    () => props.portalGroup,
    pg => {
      if (pg) {
        name.value = pg.name ?? ''
        description.value = pg.description ?? ''
        is_active.value = pg.is_active ?? true
        selectedDeviceIds.value = (pg as any).devices?.map((d: any) => d.id) ?? []
      }
    },
    { immediate: true },
  )

  watch(
    () => props.modelValue,
    val => {
      if (val && deviceStore.devices.length === 0) {
        deviceStore.loadDevices({ page_size: 100 })
      }
    },
  )
</script>

<template>
  <v-dialog :model-value="props.modelValue" max-width="900" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="props.portalGroup">
      <v-card-title class="d-flex text-h5 justify-space-between">
        {{ (portalGroup as any)?.id ? 'Editar Grupo de Portais' : 'Novo Grupo de Portais' }}
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
          <v-tab v-if="(portalGroup as any)?.id" value="dispositivos">Dispositivos</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="dados">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="name"
                    label="Nome do Grupo"
                    :rules="[v => !!v || 'Nome é obrigatório']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="description"
                    label="Descrição"
                    rows="3"
                  />
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="is_active"
                    label="Ativo"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <v-window-item value="dispositivos">
            <v-container>
              <v-select
                v-model="selectedDeviceIds"
                :items="allDevices"
                item-title="name"
                item-value="id"
                label="Catracas neste grupo"
                multiple
                chips
                hint="Selecione as catracas que pertencem a este grupo"
                persistent-hint
              />
            </v-container>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="salvar">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
