<script setup lang="ts">
  import type { UIConfig } from '@/types'
  import { computed } from 'vue'

  const props = defineProps<{
    config: UIConfig | null
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save', config: Partial<UIConfig>): void
  }>()

  const form = computed({
    get: () => ({
      display_brightness: props.config?.display_brightness ?? 100,
      display_timeout: props.config?.display_timeout ?? 30,
      keyboard_backlight: props.config?.keyboard_backlight ?? true,
      welcome_message: props.config?.welcome_message ?? 'Bem-vindo!',
      access_denied_message: props.config?.access_denied_message ?? 'Acesso Negado',
    }),
    set: () => {},
  })

  function handleSave () {
    emit('save', form.value)
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">
          Display
        </h3>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model.number="form.display_brightness"
          hide-details
          label="Brilho do Display (%)"
          max="100"
          min="0"
          type="number"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model.number="form.display_timeout"
          hide-details
          label="Timeout do Display (segundos)"
          min="0"
          type="number"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-switch
          v-model="form.keyboard_backlight"
          color="primary"
          hide-details
          label="Iluminação do Teclado"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-2">
          Mensagens
        </h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.welcome_message"
          hide-details
          label="Mensagem de Boas-Vindas"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.access_denied_message"
          hide-details
          label="Mensagem de Acesso Negado"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-btn
      block
      color="primary"
      :loading="saving"
      @click="handleSave"
    >
      Salvar Configurações de Interface
    </v-btn>
  </v-container>
</template>
