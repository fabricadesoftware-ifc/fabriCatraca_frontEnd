<script lang="ts" setup>
  import type { Device } from '@/types'
  import { ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    device: Device | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'save', v: Device): void
  }>()

  const name = ref('')
  const ip = ref('')
  const username = ref('')
  const is_active = ref(true)
  const is_default = ref(false)

  watch(() => props.device, d => {
    if (!d) return
    name.value = d.name || ''
    ip.value = d.ip || ''
    username.value = d.username || ''
    is_active.value = !!d.is_active
    is_default.value = !!d.is_default
  }, { immediate: true })

  function close () {
    emit('update:modelValue', false)
  }

  function save () {
    if (!props.device) return
    emit('save', {
      ...props.device,
      name: name.value,
      ip: ip.value,
      username: username.value,
      is_active: is_active.value,
      is_default: is_default.value,
    })
    close()
  }
</script>

<template>
  <v-dialog :model-value="props.modelValue" max-width="600" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">{{ props.device?.id ? 'Editar Dispositivo' : 'Novo Dispositivo' }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Nome" required :rules="[v => !!v || 'Obrigatório']" />
        <v-text-field v-model="ip" label="IP (host:porta)" required :rules="[v => !!v || 'Obrigatório']" />
        <v-text-field v-model="username" label="Usuário" />
        <div class="d-flex ga-4 mt-2">
          <v-switch v-model="is_active" label="Ativo" color="primary" hide-details />
          <v-switch v-model="is_default" label="Padrão" color="primary" hide-details />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


