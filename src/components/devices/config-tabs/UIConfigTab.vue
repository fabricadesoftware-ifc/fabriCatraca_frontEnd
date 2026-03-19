<script setup lang="ts">
  import type { UIConfig } from '@/types'
  import { reactive, watch } from 'vue'

  const props = defineProps<{
    config: UIConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<UIConfig>): void
  }>()

  const form = reactive({
    screen_always_on: false,
  })

  watch(
    () => props.config,
    newConfig => {
      if (newConfig) {
        form.screen_always_on = newConfig.screen_always_on ?? false
      }
    },
    { immediate: true },
  )

  function handleSave () {
    emit('save', { ...form })
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-switch
          v-model="form.screen_always_on"
          color="primary"
          hide-details
          label="Tela Sempre Ligada"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-btn block color="primary" :loading="saving" @click="handleSave">
      Salvar Configurações de Interface
    </v-btn>
  </v-container>
</template>
