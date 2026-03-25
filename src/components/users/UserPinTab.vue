<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  pin: string;
}>();

const showPin = ref(false);
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-text class="text-center pa-6">
            <v-icon class="mb-4" color="primary" icon="mdi-lock" size="48" />
            <div class="text-subtitle-1 mb-4">PIN do Usuário</div>

            <div v-if="pin" class="d-flex flex-column align-center">
              <div class="d-flex align-center ga-2 mb-4">
                <v-text-field
                  class="px-4 pin-input"
                  density="comfortable"
                  hide-details
                  :model-value="pin"
                  readonly
                  :type="showPin ? 'text' : 'password'"
                  variant="outlined"
                  style="
                    min-width: 220px;
                    max-width: 100%;
                    font-size: 1.5rem;
                    letter-spacing: 0.3em;
                  "
                >
                  <template #append-inner>
                    <v-btn
                      density="comfortable"
                      :icon="showPin ? 'mdi-eye-off' : 'mdi-eye'"
                      variant="text"
                      @click="showPin = !showPin"
                    />
                  </template>
                </v-text-field>
              </div>

              <v-chip color="success" prepend-icon="mdi-check-circle" variant="tonal">
                PIN cadastrado
              </v-chip>
            </div>

            <div v-else class="d-flex flex-column align-center">
              <v-chip color="warning" prepend-icon="mdi-alert-circle" variant="tonal">
                Nenhum PIN cadastrado
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
