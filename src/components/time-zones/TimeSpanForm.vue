<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Editar' : 'Novo' }} Período</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Dias da Semana</div>
              <v-chip-group
                v-model="selectedDays"
                column
                multiple
              >
                <v-chip
                  v-for="(day, index) in weekDays"
                  :key="index"
                  :color="getDayColor(index + 1)"
                  filter
                  variant="elevated"
                >
                  {{ day }}
                </v-chip>
              </v-chip-group>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.start"
                density="compact"
                label="Horário Inicial"
                :rules="[rules.required]"
                type="time"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.end"
                density="compact"
                label="Horário Final"
                :rules="[rules.required]"
                type="time"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Feriados</div>
              <v-chip-group
                v-model="selectedHolidays"
                column
                multiple
              >
                <v-chip
                  v-for="(holiday, index) in holidays"
                  :key="index"
                  color="purple"
                  filter
                  variant="elevated"
                >
                  {{ holiday }}
                </v-chip>
              </v-chip-group>
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
  import type { TimeSpan } from '@/types'
  import { computed, ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    timeSpan?: TimeSpan
    saving: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', data: Partial<TimeSpan>): void
  }>()

  // Estado local
  const valid = ref(false)
  const form = ref()
  const selectedDays = ref<number[]>([])
  const selectedHolidays = ref<number[]>([])

  const formData = ref({
    start: '00:00',
    end: '23:59',
  })

  // Dados estáticos
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const holidays = ['Feriado 1', 'Feriado 2', 'Feriado 3']

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const isEditing = computed(() => !!props.timeSpan)

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
      start: '00:00',
      end: '23:59',
    }
    selectedDays.value = []
    selectedHolidays.value = []
    if (form.value) {
      form.value.reset()
    }
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getDayColor = (day: number): string => {
    const colors = ['error', 'primary', 'primary', 'primary', 'primary', 'primary', 'warning']
    return colors[day - 1] || 'grey'
  }

  const save = () => {
    if (!valid.value) return

    const data: Partial<TimeSpan> = {
      start: timeToMinutes(formData.value.start),
      end: timeToMinutes(formData.value.end),
      sun: selectedDays.value.includes(0),
      mon: selectedDays.value.includes(1),
      tue: selectedDays.value.includes(2),
      wed: selectedDays.value.includes(3),
      thu: selectedDays.value.includes(4),
      fri: selectedDays.value.includes(5),
      sat: selectedDays.value.includes(6),
      hol1: selectedHolidays.value.includes(0),
      hol2: selectedHolidays.value.includes(1),
      hol3: selectedHolidays.value.includes(2),
    }

    emit('save', data)
  }

  // Watch para atualizar o formulário quando o timeSpan mudar
  watch(() => props.timeSpan, (newValue: TimeSpan | undefined) => {
    if (newValue) {
      formData.value = {
        start: minutesToTime(newValue.start),
        end: minutesToTime(newValue.end),
      }

      selectedDays.value = []
      if (newValue.sun) selectedDays.value.push(0)
      if (newValue.mon) selectedDays.value.push(1)
      if (newValue.tue) selectedDays.value.push(2)
      if (newValue.wed) selectedDays.value.push(3)
      if (newValue.thu) selectedDays.value.push(4)
      if (newValue.fri) selectedDays.value.push(5)
      if (newValue.sat) selectedDays.value.push(6)

      selectedHolidays.value = []
      if (newValue.hol1) selectedHolidays.value.push(0)
      if (newValue.hol2) selectedHolidays.value.push(1)
      if (newValue.hol3) selectedHolidays.value.push(2)
    } else {
      resetForm()
    }
  }, { immediate: true })
</script>
