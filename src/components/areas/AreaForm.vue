<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Editar' : 'Nova' }} Área</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="formData.name"
            density="compact"
            label="Nome da Área"
            :rules="[rules.required]"
            variant="outlined"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!valid"
          :loading="saving"
          @click="save"
        >
          {{ isEditing ? 'Atualizar' : 'Criar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Area } from '@/types'
  import { computed, ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    area?: Area
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', data: Partial<Area>): void
  }>()

  // Estado local
  const valid = ref(false)
  const form = ref()
  const formData = ref<Partial<Area>>({
    name: '',
  })

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const isEditing = computed(() => !!props.area)

  // Regras de validação
  const rules = {
    required: (v: string) => !!v || 'Campo obrigatório',
  }

  // Métodos
  const closeDialog = () => {
    dialog.value = false
    resetForm()
  }

  const resetForm = () => {
    formData.value = {
      name: '',
    }
    if (form.value) {
      form.value.reset()
    }
  }

  const save = () => {
    if (!valid.value) return
    emit('save', formData.value)
  }

  // Watch para atualizar o formulário quando a area mudar
  watch(() => props.area, (newValue: Area | undefined) => {
    if (newValue) {
      formData.value = {
        name: newValue.name,
      }
    } else {
      resetForm()
    }
  }, { immediate: true })
</script>
