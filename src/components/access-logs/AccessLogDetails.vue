<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">Detalhes do Log de Acesso</span>
      </v-card-title>

      <v-card-text>
        <v-row v-if="log">
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Informações Gerais</h3>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>ID do Evento</v-list-item-title>
                <v-list-item-subtitle>{{ log.id }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Data/Hora</v-list-item-title>
                <v-list-item-subtitle>{{ formatDateTime(log.time) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Tipo de Evento</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="getEventTypeColor(log.event_type)"
                    size="small"
                  >
                    {{ getEventTypeLabel(log.event_type) }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Confiança</v-list-item-title>
                <v-list-item-subtitle>{{ log.confidence }}%</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Usuário</h3>
            <v-list v-if="log.user" density="compact">
              <v-list-item>
                <v-list-item-title>Nome</v-list-item-title>
                <v-list-item-subtitle>{{ log.user.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Matrícula</v-list-item-title>
                <v-list-item-subtitle>{{ log.user.registration }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Tipo</v-list-item-title>
                <v-list-item-subtitle>{{ getUserTypeLabel(log.user.user_type_id) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="tonal">
              Usuário não identificado
            </v-alert>
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Dispositivo</h3>
            <v-list v-if="log.device" density="compact">
              <v-list-item>
                <v-list-item-title>Nome</v-list-item-title>
                <v-list-item-subtitle>{{ log.device.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>IP</v-list-item-title>
                <v-list-item-subtitle>{{ log.device.ip }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Usuário</v-list-item-title>
                <v-list-item-subtitle>{{ log.device.username }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Portal</h3>
            <v-list v-if="log.portal" density="compact">
              <v-list-item>
                <v-list-item-title>Nome</v-list-item-title>
                <v-list-item-subtitle>{{ log.portal.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Origem</v-list-item-title>
                <v-list-item-subtitle>{{ log.portal.area_from?.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Destino</v-list-item-title>
                <v-list-item-subtitle>{{ log.portal.area_to?.name }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12">
            <h3 class="text-h6 mb-3">Dados de Identificação</h3>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  density="compact"
                  label="QR Code"
                  :model-value="log.qr_code || 'N/A'"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  density="compact"
                  label="UHF"
                  :model-value="log.uhf_value || 'N/A'"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  density="compact"
                  label="PIN"
                  :model-value="log.pin_value || 'N/A'"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  density="compact"
                  label="Cartão"
                  :model-value="log.card_value || 'N/A'"
                  readonly
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          @click="dialog = false"
        >
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { AccessLogs } from '@/types'
  import { computed } from 'vue'
  import { useAccessLog } from '@/composables/useAccessLog'
  import { useUser } from '@/composables/useUser'

  const props = defineProps<{
    modelValue: boolean
    log?: AccessLogs
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const { getEventTypeColor, getEventTypeLabel, formatDateTime } = useAccessLog()
  const { getUserTypeLabel } = useUser()

  // Computed
  const dialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })
</script>
