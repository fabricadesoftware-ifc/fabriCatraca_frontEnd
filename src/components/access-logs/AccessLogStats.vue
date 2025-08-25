<template>
  <v-row class="mb-6">
    <v-col cols="12" md="3" sm="6">
      <v-card class="pa-4" color="success" dark>
        <div class="d-flex align-center">
          <v-icon class="mr-4" size="48">mdi-check-circle</v-icon>
          <div>
            <div class="text-h4 font-weight-bold">{{ stats.granted }}</div>
            <div class="text-subtitle-1">Acessos Concedidos</div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="3" sm="6">
      <v-card class="pa-4" color="error" dark>
        <div class="d-flex align-center">
          <v-icon class="mr-4" size="48">mdi-close-circle</v-icon>
          <div>
            <div class="text-h4 font-weight-bold">{{ stats.denied }}</div>
            <div class="text-subtitle-1">Acessos Negados</div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="3" sm="6">
      <v-card class="pa-4" color="warning" dark>
        <div class="d-flex align-center">
          <v-icon class="mr-4" size="48">mdi-alert-circle</v-icon>
          <div>
            <div class="text-h4 font-weight-bold">{{ stats.pending }}</div>
            <div class="text-subtitle-1">Acessos Pendentes</div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="3" sm="6">
      <v-card class="pa-4" color="info" dark>
        <div class="d-flex align-center">
          <v-icon class="mr-4" size="48">mdi-clock</v-icon>
          <div>
            <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
            <div class="text-subtitle-1">Total de Eventos</div>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  defineProps<{
    stats: {
      granted: number
      denied: number
      pending: number
      total: number
    }
  }>()
</script>
