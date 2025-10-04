<script lang="ts" setup>
  import type { AccessRule } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import { toast } from 'vue3-toastify'
  import accessRuleTimeZonesService from '@/services/access_rule_time_zones'
  import groupAccessRulesService from '@/services/group_access_rules'
  import timeSpansService from '@/services/time_spans'
  import timeZonesService from '@/services/time_zones'
  import { useGroupStore } from '@/stores'

  const props = defineProps<{ modelValue: boolean, accessRule: AccessRule | null }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void, (e: 'saved'): void }>()

  const groupStore = useGroupStore()
  const selectedGroupId = ref<number | null>(null)
  const saving = ref(false)

  type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
  const dayLabels: Record<DayKey, string> = {
    sun: 'Domingo', mon: 'Segunda', tue: 'Terça', wed: 'Quarta', thu: 'Quinta', fri: 'Sexta', sat: 'Sábado',
  }

  const schedule = reactive<Record<DayKey, { enabled: boolean, start: string, end: string }>>({
    sun: { enabled: false, start: '07:00', end: '17:00' },
    mon: { enabled: false, start: '07:00', end: '17:00' },
    tue: { enabled: false, start: '07:00', end: '17:00' },
    wed: { enabled: false, start: '07:00', end: '17:00' },
    thu: { enabled: false, start: '07:00', end: '17:00' },
    fri: { enabled: false, start: '07:00', end: '17:00' },
    sat: { enabled: false, start: '07:00', end: '17:00' },
  })

  // eslint-disable-next-line @stylistic/max-statements-per-line
  function close () {
    emit('update:modelValue', false)
  }

  function parseHHMMToSeconds (hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number)
    const hours = Number.isFinite(h) ? h : 0
    const mins = Number.isFinite(m) ? m : 0
    return hours * 3600 + mins * 60
  }

  function secondsToHHMM (secs: number): string {
    const total = Number(secs) || 0
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    return `${hh}:${mm}`
  }

  async function loadExistingForGroup (groupId: number) {
    console.log('Carregando horários para grupo:', groupId)

    if (!props.accessRule) {
      console.warn('Nenhuma regra de acesso selecionada')
      return
    }

    // reset schedule
    for (const d of (Object.keys(schedule) as DayKey[])) {
      schedule[d].enabled = false
    }

    try {
      // Primeiro verifica se existe vínculo grupo-regra
      const groupRules = await groupAccessRulesService.getGroupAccessRules({
        group_id: groupId,
        access_rule_id: props.accessRule.id,
      })

      if (!groupRules.results?.length) {
        console.log('Grupo não tem vínculo com esta regra')
        return
      }

      // Busca TZ vinculadas à regra
      console.log('Buscando timezones da regra:', props.accessRule.id)
      const relations = await accessRuleTimeZonesService.getAccessRuleTimeZones({
        access_rule_id: props.accessRule.id,
      })
      console.log('Relações encontradas:', relations)

      const items = relations.results || []
      for (const rel of items) {
        const tzId = (rel?.time_zone as any)?.id ?? (rel as any)?.time_zone_id
        if (!tzId) {
          console.warn('TimeZone ID não encontrado na relação:', rel)
          continue
        }

        // carrega timespans do tz
        console.log('Buscando timespans da timezone:', tzId)
        const spansResp = await timeSpansService.getTimeSpans({ time_zone: tzId })
        console.log('Timespans encontrados:', spansResp)

        const spans = spansResp.results || []
        for (const ts of spans) {
          const map: { key: DayKey, val: boolean }[] = [
            { key: 'sun', val: (ts as any).sun },
            { key: 'mon', val: (ts as any).mon },
            { key: 'tue', val: (ts as any).tue },
            { key: 'wed', val: (ts as any).wed },
            { key: 'thu', val: (ts as any).thu },
            { key: 'fri', val: (ts as any).fri },
            { key: 'sat', val: (ts as any).sat },
          ]

          // Habilita todos os dias que estão marcados como true
          for (const { key, val } of map) {
            if (val) {
              console.log('Configurando horário para:', key)
              schedule[key].enabled = true
              schedule[key].start = secondsToHHMM((ts as any).start)
              schedule[key].end = secondsToHHMM((ts as any).end)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
    }
  }

  async function ensureGroupAccessRule (groupId: number, accessRuleId: number) {
    const existing = await groupAccessRulesService.getGroupAccessRules({ group_id: groupId, access_rule_id: accessRuleId })
    if ((existing.results || []).length === 0) {
      await groupAccessRulesService.createGroupAccessRule({ group_id: groupId, access_rule_id: accessRuleId })
    }
  }

  async function saveSchedule () {
    if (!props.accessRule || !selectedGroupId.value) return
    saving.value = true
    try {
      const groupId = selectedGroupId.value
      const ruleId = props.accessRule.id

      // Garante vínculo grupo-regra
      await ensureGroupAccessRule(groupId, ruleId)

      // Para cada dia habilitado cria uma TimeZone e um TimeSpan exclusivo daquele dia
      const dayOrder: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      for (const day of dayOrder) {
        const cfg = schedule[day]
        if (!cfg.enabled) continue

        const start = parseHHMMToSeconds(cfg.start)
        const end = parseHHMMToSeconds(cfg.end)
        if (!(start < end)) continue

        // Cria timezone
        const tzName = `TZ-${groupId}-${day.toUpperCase()}`
        const tz = await timeZonesService.createTimeZone({ name: tzName })
        const tzId = (tz as any)?.data?.id ?? (tz as any)?.data ?? (tz as any)?.id

        // Cria timespan com flags do dia
        const flags: Record<DayKey, boolean> = { sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false }
        flags[day] = true
        await timeSpansService.createTimeSpan({
          time_zone: tzId,
          start,
          end,
          sun: flags.sun,
          mon: flags.mon,
          tue: flags.tue,
          wed: flags.wed,
          thu: flags.thu,
          fri: flags.fri,
          sat: flags.sat,
          hol1: false,
          hol2: false,
          hol3: false,
        })

        // Vincula timezone à access rule
        await accessRuleTimeZonesService.createAccessRuleTimeZone({ access_rule_id: ruleId, time_zone_id: tzId })
      }

      toast.success('Horário salvo com sucesso!')
      emit('saved')
      close()
    } catch (error) {
      console.error('Erro ao salvar horário:', error)
      toast.error('Erro ao salvar horário. Por favor, tente novamente.')
    } finally {
      saving.value = false
    }
  }

  onMounted(async () => {
    if (groupStore.groups.length === 0) {
      await groupStore.loadGroups()
    }
  })

  // Quando abrir o diálogo, carregar grupos e horários existentes
  watch(() => props.modelValue, async v => {
    if (v) {
      // Carrega os grupos se necessário
      if (groupStore.groups.length === 0) {
        await groupStore.loadGroups()
      }

      // Busca grupo-regra existente
      if (props.accessRule) {
        const relations = await groupAccessRulesService.getGroupAccessRules({ access_rule_id: props.accessRule.id })
        const existingGroup = relations.results?.[0]?.group
        if (existingGroup) {
          console.log('Grupo encontrado:', existingGroup)
          selectedGroupId.value = existingGroup.id
          await loadExistingForGroup(existingGroup.id)
        }
      }
    }
  })

  // Quando mudar o grupo selecionado, carregar horários
  watch(selectedGroupId, async v => {
    if (props.modelValue && v) {
      await loadExistingForGroup(v)
    }
  })
</script>

<template>
  <v-dialog max-width="800" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">Definir horários por turma</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedGroupId"
          density="comfortable"
          item-title="name"
          item-value="id"
          :items="groupStore.groups"
          label="Turma (Grupo)"
          prepend-inner-icon="mdi-account-group"
          variant="outlined"
        />

        <v-alert class="mt-3 mb-5" density="comfortable" type="info" variant="tonal">
          Ative os dias desejados e defina o intervalo de acesso. Cada dia criará uma faixa horária independente.
        </v-alert>

        <v-row>
          <v-col
            v-for="(label, key) in dayLabels"
            :key="key"
            cols="12"
            md="4"
            sm="6"
          >
            <v-card class="day-card" variant="tonal">
              <v-card-title class="d-flex align-center justify-space-between py-2">
                <span class="text-subtitle-2">{{ label }}</span>
                <v-switch v-model="schedule[key as DayKey].enabled" color="primary" density="compact" hide-details />
              </v-card-title>
              <v-card-text class="pt-0">
                <div class="time-fields">
                  <v-text-field
                    v-model="schedule[key as DayKey].start"
                    density="compact"
                    :disabled="!schedule[key as DayKey].enabled"
                    hide-details
                    label="Início"
                    type="time"
                    variant="outlined"
                  />
                  <v-text-field
                    v-model="schedule[key as DayKey].end"
                    density="compact"
                    :disabled="!schedule[key as DayKey].enabled"
                    hide-details
                    label="Fim"
                    type="time"
                    variant="outlined"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!selectedGroupId" :loading="saving" @click="saveSchedule">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.day-card {
  border-radius: 12px;
}
.time-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
