<script lang="ts" setup>
  import { computed } from 'vue'

  interface Props {
    title: string
    description: string
    value: number
    icon?: string
    iconColor?: string
    color?: string
    variant?: 'dark' | 'light'
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    icon: 'mdi-chart-line',
    iconColor: 'primary',
    color: 'primary',
    variant: 'dark',
    trend: 'neutral',
    trendValue: '',
  })

  // Computed para determinar se o card é escuro ou claro
  const isDark = computed(() => props.variant === 'dark')

  // Computed para cor do trend baseada no valor da prop
  const trendColor = computed(() => {
    switch (props.trend) {
      case 'up': {
        return 'success'
      }
      case 'down': {
        return 'error'
      }
      default: {
        return 'grey'
      }
    }
  })

  // Computed para ícone do trend
  const trendIcon = computed(() => {
    switch (props.trend) {
      case 'up': {
        return 'mdi-trending-up'
      }
      case 'down': {
        return 'mdi-trending-down'
      }
      default: {
        return 'mdi-minus'
      }
    }
  })

  // Computed para cor do ícone principal
  const mainIconColor = computed(() => {
    if (isDark.value) {
      return props.iconColor || 'white'
    }
    return props.iconColor || props.color
  })
</script>

<template>
  <v-card
    class="stat-card"
    :class="{ 'stat-card-light': !isDark, 'stat-card-dark': isDark }"
    :color="color"
    elevation="4"
    rounded="lg"
    variant="elevated"
  >
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between">
        <!-- Conteúdo principal -->
        <div class="flex-grow-1">
          <div class="d-flex align-center mb-2">
            <v-icon
              class="mr-3"
              :color="mainIconColor"
              :icon="icon"
              size="32"
            />
            <h3 class="text-h6 font-weight-medium mb-0">
              {{ title }}
            </h3>
          </div>

          <p class="text-body-2 opacity-75 mb-3">
            {{ description }}
          </p>

          <div class="d-flex align-center">
            <span class="text-h3 font-weight-bold">
              {{ value }}
            </span>

            <!-- Trend indicator -->
            <div
              v-if="trendValue"
              class="d-flex align-center ml-4"
            >
              <v-icon
                class="mr-1"
                :color="trendColor"
                :icon="trendIcon"
                size="20"
              />
              <span
                :class="`text-caption font-weight-medium text-${trendColor}`"
              >
                {{ trendValue }}
              </span>
            </div>
          </div>
        </div>

        <!-- Decorative element -->
        <div class="stat-card-decoration">
          <v-icon
            :color="mainIconColor"
            :icon="icon"
            opacity="0.1"
            size="64"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
  .stat-card {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    }

    .stat-card-decoration {
      position: absolute;
      top: -10px;
      right: -10px;
      opacity: 0.1;
      pointer-events: none;
    }

    .v-card-text {
      position: relative;
      z-index: 1;
    }
  }

  // Estilos para cards claros
  .stat-card-light {
    background-color: white !important;
    color: #333 !important;

    .text-h6,
    .text-body-2,
    .text-h3,
    .text-caption {
      color: #333 !important;
    }

    .opacity-75 {
      opacity: 0.7 !important;
    }
  }

  // Estilos para cards escuros
  .stat-card-dark {
    color: white !important;

    .text-h6,
    .text-body-2,
    .text-h3,
    .text-caption {
      color: white !important;
    }

    .opacity-75 {
      opacity: 0.75 !important;
    }
  }
</style>
