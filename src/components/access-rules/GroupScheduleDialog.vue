<script lang="ts" setup>
  import type { AccessRule } from '@/types'
  import { onMounted, reactive, ref, watch } from 'vue'
  import { toast } from 'vue3-toastify'
  import accessRuleTimeZonesService from '@/services/access_rule_time_zones'
  import groupAccessRulesService from '@/services/group_access_rules'
  import timeSpansService from '@/services/time_spans'
  import timeZonesService from '@/services/time_zones'
  import { useGroupStore } from '@/stores'

  const props = defineProps<{
    modelValue: boolean
    accessRule: AccessRule | null
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'saved'): void
  }>()

  const groupStore = useGroupStore()
  const selectedGroupId = ref<number | null>(null)
  const saving = ref(false)

  type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
  const dayLabels: Record<DayKey, string> = {
    sun: 'Domingo',
    mon: 'Segunda',
    tue: 'Terça',
    wed: 'Quarta',
    thu: 'Quinta',
    fri: 'Sexta',
    sat: 'Sábado',
  }

  const schedule = reactive<
    Record<DayKey, { enabled: boolean, start: string, end: string }>
  >({
    sun: { enabled: false, start: '07:00', end: '17:00' },
    mon: { enabled: false, start: '07:00', end: '17:00' },
    tue: { enabled: false, start: '07:00', end: '17:00' },
    wed: { enabled: false, start: '07:00', end: '17:00' },
    thu: { enabled: false, start: '07:00', end: '17:00' },
    fri: { enabled: false, start: '07:00', end: '17:00' },
    sat: { enabled: false, start: '07:00', end: '17:00' },
  })

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
    if (!props.accessRule) {
      return
    }

    // reset schedule
    for (const d of Object.keys(schedule) as DayKey[]) {
      schedule[d].enabled = false
    }

    try {
      // Primeiro verifica se existe vínculo grupo-regra
      const groupRules = await groupAccessRulesService.getGroupAccessRules({
        group_id: groupId,
        access_rule_id: props.accessRule.id,
      })

      if (!groupRules.results?.length) {
        return
      }

      // Busca TZ vinculadas à regra
      const relations = await accessRuleTimeZonesService.getAccessRuleTimeZones({
        access_rule_id: props.accessRule.id,
      })

      const items = relations.results || []
      for (const rel of items) {
        const tzId = (rel?.time_zone as any)?.id ?? (rel as any)?.time_zone_id
        if (!tzId) {
          continue
        }

        // carrega timespans do tz
        const spansResp = await timeSpansService.getTimeSpans({
          time_zone: tzId,
        })

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
              schedule[key].enabled = true
              schedule[key].start = secondsToHHMM((ts as any).start)
              schedule[key].end = secondsToHHMM((ts as any).end)
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function ensureGroupAccessRule (groupId: number, accessRuleId: number) {
    const existing = await groupAccessRulesService.getGroupAccessRules({
      group_id: groupId,
      access_rule_id: accessRuleId,
    })
    if ((existing.results || []).length === 0) {
      await groupAccessRulesService.createGroupAccessRule({
        group_id: groupId,
        access_rule_id: accessRuleId,
      })
    }
  }

  async function deleteExistingSchedulesForGroup (
    groupId: number,
    ruleId: number,
  ) {
    try {
      // 1. Busca relações grupo-regra-timezone
      const relations = await accessRuleTimeZonesService.getAccessRuleTimeZones({
        access_rule_id: ruleId,
      })

      // 2. Para cada relação, deletar na ordem reversa (relação → timezone → timespan)
      for (const rel of relations.results || []) {
        const relId = (rel as any)?.id
        const tzId = (rel as any)?.time_zone?.id ?? (rel as any)?.time_zone_id

        if (!tzId) continue

        try {
          // PRIMEIRO: Deleta relação access_rule_time_zone (desvincula)
          if (relId) {
            try {
              await accessRuleTimeZonesService.deleteAccessRuleTimeZone(relId)
            } catch (error: any) {
              if (error?.response?.status === 404) {
              // Relação já foi deletada
              } else {
                console.warn('  ⚠️ Erro ao deletar relação:', error?.message)
              }
            }
          }

          // SEGUNDO: Deleta timespans do timezone
          const spansResp = await timeSpansService.getTimeSpans({
            time_zone: tzId,
          })

          for (const span of spansResp.results || []) {
            const spanId = (span as any)?.id
            if (spanId) {
              try {
                await timeSpansService.deleteTimeSpan(spanId)
              } catch (error: any) {
                if (error?.response?.status === 404) {
                // TimeSpan já foi deletado
                } else {
                  console.warn('  ⚠️ Erro ao deletar TimeSpan:', error?.message)
                }
              }
            }
          }

          // TERCEIRO: Deleta o timezone
          try {
            await timeZonesService.deleteTimeZone(tzId)
          } catch (error: any) {
            if (error?.response?.status === 404) {
            // TimeZone já foi deletado
            } else {
              console.warn('  ⚠️ Erro ao deletar TimeZone:', error?.message)
            }
          }
        } catch (error) {
          // Erro geral nesta relação, continua com as próximas
          console.warn('  ⚠️ Erro ao processar relação, continuando...', error)
        }
      }
    } catch (error) {
      console.error(error)
    // Não propaga o erro - permite que o salvamento continue mesmo com falha na limpeza
    }
  }

  async function saveSchedule () {
    if (!props.accessRule || !selectedGroupId.value) return

    const groupId = selectedGroupId.value
    const ruleId = props.accessRule.id

    // Valida horários e coleta dias habilitados
    const dayOrder: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const validSchedules: { day: DayKey, start: number, end: number }[] = []

    for (const day of dayOrder) {
      const cfg = schedule[day]
      if (!cfg.enabled) continue

      const start = parseHHMMToSeconds(cfg.start)
      const end = parseHHMMToSeconds(cfg.end)

      // Validação: início deve ser menor que fim
      if (!(start < end)) {
        toast.error(
          `Horário inválido para ${dayLabels[day]}: início (${cfg.start}) deve ser antes do fim (${cfg.end})`,
        )
        return
      }

      validSchedules.push({ day, start, end })
    }

    saving.value = true

    try {
      // Garante vínculo grupo-regra
      await ensureGroupAccessRule(groupId, ruleId)

      // PASSO 1: DELETAR TODOS OS HORÁRIOS EXISTENTES (substituição completa)
      await deleteExistingSchedulesForGroup(groupId, ruleId)

      // Se nenhum dia está habilitado, apenas limpa e sai
      if (validSchedules.length === 0) {
        toast.success('Horários removidos com sucesso!')
        emit('saved')
        close()
        return
      }

      // PASSO 2: AGRUPAR DIAS COM HORÁRIOS IDÊNTICOS (otimização)
      // Map<"start-end", DayKey[]>
      const scheduleGroups = new Map<string, DayKey[]>()

      for (const { day, start, end } of validSchedules) {
        const key = `${start}-${end}`
        const existing = scheduleGroups.get(key) || []
        existing.push(day)
        scheduleGroups.set(key, existing)
      }

      // PASSO 3: CRIAR UM TIMEZONE/TIMESPAN POR GRUPO DE HORÁRIOS
      for (const [timeKey, days] of scheduleGroups.entries()) {
        const [startStr, endStr] = timeKey.split('-')
        const start = Number.parseInt(startStr)
        const end = Number.parseInt(endStr)

        // Nome descritivo para o timezone
        const dayNames = days.map(d => d.toUpperCase()).join('-')
        const tzName = `G${groupId}-R${ruleId}-${dayNames}-${start}to${end}`

        // Cria timezone
        const tz = await timeZonesService.createTimeZone({ name: tzName })
        const tzId
          = (tz as any)?.data?.id ?? (tz as any)?.data ?? (tz as any)?.id

        if (!tzId) {
          throw new Error('Falha ao criar TimeZone - ID não retornado')
        }

        // Cria flags para os dias deste grupo
        const flags: Record<DayKey, boolean> = {
          sun: false,
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
        }

        for (const day of days) {
          flags[day] = true
        }

        // Cria timespan com múltiplas flags (otimizado!)
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
        await accessRuleTimeZonesService.createAccessRuleTimeZone({
          access_rule_id: ruleId,
          time_zone_id: tzId,
        })
      }

      toast.success(
        `Horários salvos com sucesso! (${validSchedules.length} dia(s) configurado(s))`,
      )
      emit('saved')
      close()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar horários. Por favor, tente novamente.')
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
  watch(
    () => props.modelValue,
    async v => {
      if (v) {
        // Carrega os grupos se necessário
        if (groupStore.groups.length === 0) {
          await groupStore.loadGroups()
        }

        // Busca grupo-regra existente
        if (props.accessRule) {
          const relations = await groupAccessRulesService.getGroupAccessRules({
            access_rule_id: props.accessRule.id,
          })
          const existingGroup = relations.results?.[0]?.group
          if (existingGroup) {
            selectedGroupId.value = existingGroup.id
            await loadExistingForGroup(existingGroup.id)
          }
        }
      }
    },
  )

  // Quando mudar o grupo selecionado, carregar horários
  watch(selectedGroupId, async v => {
    if (props.modelValue && v) {
      await loadExistingForGroup(v)
    }
  })
</script>

<template>
  <v-dialog
    max-width="800"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
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

        <v-alert
          class="mt-3 mb-5"
          density="comfortable"
          type="info"
          variant="tonal"
        >
          Ative os dias desejados e defina o intervalo de acesso. Cada dia
          criará uma faixa horária independente.
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
              <v-card-title
                class="d-flex align-center justify-space-between py-2"
              >
                <span class="text-subtitle-2">{{ label }}</span>
                <v-switch
                  v-model="schedule[key as DayKey].enabled"
                  color="primary"
                  density="compact"
                  hide-details
                />
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
        <v-btn
          color="primary"
          :disabled="!selectedGroupId"
          :loading="saving"
          @click="saveSchedule"
        >Salvar</v-btn>
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
