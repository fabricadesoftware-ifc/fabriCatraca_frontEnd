<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5">
        {{ isEditing ? 'Editar' : 'Nova' }} Regra de Acesso
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="Nome da Regra"
                required
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.type"
                :items="typeOptions"
                label="Tipo de Regra"
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
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.priority"
                :items="priorityOptions"
                label="Prioridade"
                required
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_active"
                color="primary"
                label="Regra Ativa"
              />
            </v-col>
          </v-row>

          <v-expansion-panels class="mt-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                Configurações Avançadas
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.time_zones"
                      chips
                      closable-chips
                      :items="timeZones"
                      label="Horários de Acesso"
                      multiple
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.areas"
                      chips
                      closable-chips
                      :items="areas"
                      label="Áreas Permitidas"
                      multiple
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
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
  import type { AccessRule, Area, TimeZone } from '@/types'
  import { computed, ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    rule?: AccessRule
    saving: boolean
    timeZones: TimeZone[]
    areas: Area[]
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', data: Partial<AccessRule>): void
  }>()

  // Estado local
  const valid = ref(false)
  const form = ref()
  const formData = ref<Partial<AccessRule>>({
    name: '',
    description: '',
    type: 'allow',
    priority: 1,
    is_active: true,
    time_zones: [],
    areas: [],
  })

  // Dados estáticos
  const typeOptions = [
    { title: 'Permitir', value: 'allow' },
    { title: 'Negar', value: 'deny' },
    { title: 'Condicional', value: 'conditional' },
  ]

  const priorityOptions = [
    { title: 'Baixa (1)', value: 1 },
    { title: 'Média (2)', value: 2 },
    { title: 'Alta (3)', value: 3 },
    { title: 'Crítica (4)', value: 4 },
    { title: 'Máxima (5)', value: 5 },
  ]

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const isEditing = computed(() => !!props.rule)

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
      type: 'allow',
      priority: 1,
      is_active: true,
      time_zones: [],
      areas: [],
    }
    if (form.value) {
      form.value.reset()
    }
  }

  const save = () => {
    if (!valid.value) return
    emit('save', formData.value)
  }

  // Watch para atualizar o formulário quando a regra mudar
  watch(() => props.rule, (newValue: AccessRule | undefined) => {
    if (newValue) {
      formData.value = {
        name: newValue.name,
        description: newValue.description,
        type: newValue.type,
        priority: newValue.priority,
        is_active: newValue.is_active,
        time_zones: newValue.time_zones?.map((tz: TimeZone | number) => typeof tz === 'number' ? tz : tz.id) || [],
        areas: newValue.areas?.map((area: Area | number) => typeof area === 'number' ? area : area.id) || [],
      }
    } else {
      resetForm()
    }
  }, { immediate: true })
</script>
