<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5">
        {{ isEditing ? 'Editar Grupo' : 'Novo Grupo' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Nome do Grupo"
                required
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                auto-grow
                label="Descrição"
                rows="3"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="formData.is_active"
                color="primary"
                label="Grupo Ativo"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
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
  import type { Group } from '@/types'
  import { computed, ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    group?: Group
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', data: Partial<Group>): void
  }>()

  // Estado local
  const valid = ref(false)
  const form = ref()
  const formData = ref<Partial<Group>>({
    name: '',
    description: '',
    is_active: true,
  })

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const isEditing = computed(() => !!props.group)

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
      description: '',
      is_active: true,
    }
    if (form.value) {
      form.value.reset()
    }
  }

  const save = () => {
    if (!valid.value) return
    emit('save', formData.value)
  }

  // Watch para atualizar o formulário quando o grupo mudar
  watch(() => props.group, (newValue: Group | undefined) => {
    if (newValue) {
      formData.value = {
        name: newValue.name,
        description: newValue.description,
        is_active: newValue.is_active,
      }
    } else {
      resetForm()
    }
  }, { immediate: true })
</script>
