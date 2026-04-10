<script lang="ts" setup>
import type { Device } from "@/types";

const props = defineProps<{
  cardEnrollDevice: number | null;
  capturedCardValue: number | null;
  enrollingCard: boolean;
  existingCards: Array<{ id: number; value: number }>;
  deletingCardId: number | null;
  devices: Device[];
}>();

const emit = defineEmits<{
  (e: "update:cardEnrollDevice", value: number | null): void;
  (e: "start-enroll"): void;
  (e: "delete-card", value: number): void;
}>();
</script>

<template>
  <v-card class="mt-4" variant="outlined">
    <v-card-title class="text-subtitle-1 d-flex align-center">
      <v-icon class="mr-2" color="primary" icon="mdi-credit-card-wireless" />
      Cartoes
    </v-card-title>
    <v-card-text>
      <div v-if="props.existingCards.length > 0">
        <v-table class="mb-4" density="compact">
          <thead>
            <tr>
              <th class="text-left">Valor</th>
              <th class="text-end">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="card in props.existingCards" :key="card.id">
              <td>{{ card.value }}</td>
              <td class="text-end">
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="x-small"
                  variant="text"
                  :loading="props.deletingCardId === card.id"
                  @click="emit('delete-card', card.id)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <v-select
        :model-value="props.cardEnrollDevice"
        item-title="name"
        item-value="id"
        :items="props.devices.filter((device) => device.is_active)"
        label="Catraca para captura"
        density="comfortable"
        @update:model-value="emit('update:cardEnrollDevice', ($event as number | null) ?? null)"
      >
        <template #append-inner>
          <v-btn
            color="primary"
            :loading="props.enrollingCard"
            :disabled="!props.cardEnrollDevice"
            icon="mdi-credit-card-plus"
            size="small"
            variant="text"
            @click.stop="emit('start-enroll')"
          />
          <v-btn
            color="primary"
            :disabled="props.enrollingCard || !props.cardEnrollDevice"
            variant="text"
            size="small"
            @click.stop="emit('start-enroll')"
          >
            Capturar
          </v-btn>
        </template>
      </v-select>

      <v-alert
        v-if="props.capturedCardValue"
        class="mt-2"
        color="success"
        density="compact"
        icon="mdi-check-circle"
        variant="tonal"
      >
        Cartao capturado: <strong>{{ props.capturedCardValue }}</strong>
      </v-alert>
    </v-card-text>
  </v-card>
</template>
