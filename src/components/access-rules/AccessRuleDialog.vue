<script lang="ts" setup>
  import type { AccessRule } from '@/types'
  import { ref, watch } from 'vue'

  const props = defineProps<{ modelValue: boolean, rule: AccessRule | null }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void, (e: 'save', v: AccessRule): void }>()

  const name = ref('')
  const type = ref<number>(1)
  const priority = ref<number>(1)

  watch(() => props.rule, r => {
    if (!r) return
    name.value = r.name || ''
    type.value = Number(r.type) || 1
    priority.value = Number(r.priority) || 1
  }, { immediate: true })

  function close () { emit('update:modelValue', false) }
  function save () {
    if (!props.rule) return
    emit('save', { ...props.rule, name: name.value, type: type.value, priority: priority.value } as AccessRule)
    close()
  }
</script>

<template>
  <v-dialog :model-value="props.modelValue" max-width="600" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">{{ props.rule?.id ? 'Editar Regra' : 'Nova Regra' }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Nome" required :rules="[v => !!v || 'Obrigatório']" />
        <v-text-field v-model.number="type" label="Tipo (número)" type="number" />
        <v-text-field v-model.number="priority" label="Prioridade" type="number" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


