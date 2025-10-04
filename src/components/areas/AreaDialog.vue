<script lang="ts" setup>
  import type { Area, AreaCreate } from '@/types'
  import { ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    area?: Partial<Area>
  }>()

  const tab = ref('dados')
  const name = ref('')

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', value: Area | AreaCreate): void
  }>()

  async function salvarArea () {
    if (props.area?.id) {
      emit('save', {
        id: props.area.id,
        name: name.value,
      })
    } else {
      emit('save', {
        name: name.value,
      })
    }
    closeDialog()
  }

  // Atualiza os campos locais quando o props.group mudar

  function closeDialog () {
    emit('update:modelValue', false)
  }

  watch(
    () => props.area,
    newArea => {
      if (newArea) {
        name.value = newArea.name ?? ''
      }
    },
    { immediate: true },
  )
</script>

<template>
  <v-dialog max-width="900" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="props.area">
      <v-card-title class="text-h5">Editar Area</v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
        </v-tabs>
        <v-window>
          <v-window-item value="dados">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="name"
                    label="Nome da Area"
                    required
                    :rules="[v => !!v || 'Nome é obrigatório']"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="salvarArea">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
