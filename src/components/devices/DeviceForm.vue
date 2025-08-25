<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Editar' : 'Nova' }} Catraca</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                density="compact"
                label="Nome da Catraca"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.ip"
                density="compact"
                label="Endereço IP"
                :rules="[rules.required, rules.ip]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.username"
                density="compact"
                label="Usuário"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_active"
                color="success"
                label="Ativo"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_default"
                color="primary"
                label="Dispositivo Padrão"
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
  import type { Device } from '@/types'
  import { computed, ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    device?: Device
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', data: Partial<Device>): void
  }>()

  // Estado local
  const valid = ref(false)
  const form = ref()
  const formData = ref<Partial<Device>>({
    name: '',
    ip: '',
    username: '',
    is_active: true,
    is_default: false,
  })

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const isEditing = computed(() => !!props.device)

  // Regras de validação
  const rules = {
    required: (v: string) => !!v || 'Campo obrigatório',
    ip: (v: string) => {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      return ipRegex.test(v) || 'Endereço IP inválido'
    },
  }

  // Métodos
  const closeDialog = () => {
    dialog.value = false
    resetForm()
  }

  const resetForm = () => {
    formData.value = {
      name: '',
      ip: '',
      username: '',
      is_active: true,
      is_default: false,
    }
    if (form.value) {
      form.value.reset()
    }
  }

  const save = () => {
    if (!valid.value) return
    emit('save', formData.value)
  }

  // Watch para atualizar o formulário quando o device mudar
  watch(() => props.device, (newValue: Device | undefined) => {
    if (newValue) {
      formData.value = {
        name: newValue.name,
        ip: newValue.ip,
        username: newValue.username,
        is_active: newValue.is_active,
        is_default: newValue.is_default,
      }
    } else {
      resetForm()
    }
  }, { immediate: true })
</script>
