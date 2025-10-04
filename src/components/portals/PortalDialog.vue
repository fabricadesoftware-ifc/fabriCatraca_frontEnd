<script lang="ts" setup>
  import type { Portal } from '@/types'
  import { onMounted, ref, watch } from 'vue'
  import { useAreaStore } from '@/stores'

  const props = defineProps<{ modelValue: boolean, portal: Portal | null }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void, (e: 'save', v: Portal): void }>()

  const areaStore = useAreaStore()
  const name = ref('')
  const areaFrom = ref<number | null>(null)
  const areaTo = ref<number | null>(null)
  const loading = ref(false)

  watch(() => props.portal, p => {
    if (!p) return
    name.value = p.name || ''
    areaFrom.value = typeof p.area_from === 'number' ? p.area_from : (p.area_from?.id ?? null)
    areaTo.value = typeof p.area_to === 'number' ? p.area_to : (p.area_to?.id ?? null)
  }, { immediate: true })

  function close () {
    emit('update:modelValue', false)
  }

  function save () {
    if (!props.portal || !areaFrom.value || !areaTo.value) return
    emit('save', {
      ...props.portal,
      name: name.value,
      area_from: areaFrom.value,
      area_to: areaTo.value,
    } as unknown as Portal)
    close()
  }

  onMounted(async () => {
    loading.value = true
    try {
      await areaStore.loadAreas()
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <v-dialog max-width="600" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="props.portal">
      <v-card-title class="text-h6">
        {{ props.portal.id ? 'Editar Entrada/Saída' : 'Nova Entrada/Saída' }}
      </v-card-title>

      <v-card-text>
        <v-progress-linear
          v-if="loading"
          class="mb-4"
          color="primary"
          indeterminate
        />

        <v-text-field
          v-model="name"
          label="Nome"
          required
          :rules="[v => !!v || 'Obrigatório']"
          variant="outlined"
        />

        <v-select
          v-model="areaFrom"
          class="mt-4"
          item-title="name"
          item-value="id"
          :items="areaStore.areas"
          label="Área de Origem"
          prepend-inner-icon="mdi-map-marker"
          required
          :rules="[v => !!v || 'Obrigatório']"
          variant="outlined"
        />

        <v-select
          v-model="areaTo"
          class="mt-4"
          item-title="name"
          item-value="id"
          :items="areaStore.areas"
          label="Área de Destino"
          prepend-inner-icon="mdi-map-marker-check"
          required
          :rules="[v => !!v || 'Obrigatório']"
          variant="outlined"
        />

        <v-alert
          v-if="areaFrom && areaTo && areaFrom === areaTo"
          class="mt-4"
          density="compact"
          type="warning"
          variant="tonal"
        >
          As áreas de origem e destino devem ser diferentes
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn
          color="primary"
          :disabled="!name || !areaFrom || !areaTo || areaFrom === areaTo"
          @click="save"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
