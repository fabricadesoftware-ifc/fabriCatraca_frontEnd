<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Editar' : 'Novo' }} Usuário</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                density="compact"
                label="Nome Completo"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.registration"
                density="compact"
                label="Matrícula"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.user_type_id"
                density="compact"
                :items="userTypes"
                label="Tipo de Usuário"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="formData.devices"
                chips
                density="compact"
                item-title="name"
                item-value="id"
                :items="availableDevices"
                label="Dispositivos de Acesso"
                multiple
                variant="outlined"
              />
            </v-col>
          </v-row>
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
import type { User, Device } from '@/types'
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  user?: User
  saving: boolean
  availableDevices: Device[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: Partial<User>): void
}>()

// Estado local
const valid = ref(false)
const form = ref()
const formData = ref<Partial<User>>({
  name: '',
  registration: '',
  user_type_id: 1,
  devices: [],
})

// Dados estáticos
const userTypes = [
  { title: 'Aluno', value: 1 },
  { title: 'Professor', value: 2 },
  { title: 'Funcionário', value: 3 },
  { title: 'Administrador', value: 4 },
]

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.user)

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
    registration: '',
    user_type_id: 1,
    devices: [],
  }
  if (form.value) {
    form.value.reset()
  }
}

const save = () => {
  if (!valid.value) return
  emit('save', formData.value)
}

// Watch para atualizar o formulário quando o user mudar
watch(() => props.user, (newValue) => {
  if (newValue) {
    formData.value = {
      name: newValue.name,
      registration: newValue.registration,
      user_type_id: newValue.user_type_id,
      devices: Array.isArray(newValue.devices) ? newValue.devices.map(d => typeof d === 'number' ? d : d.id) : [],
    }
  } else {
    resetForm()
  }
}, { immediate: true })
</script>
