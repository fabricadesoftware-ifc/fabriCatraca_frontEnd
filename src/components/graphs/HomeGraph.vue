<script setup lang="ts">
  import * as echarts from 'echarts'
  import { computed, onMounted, ref, watch } from 'vue'

  interface Props {
    approvedLogs: any[]
    rejectedLogs: any[]
  }

  const props = defineProps<Props>()
  const chartRef = ref<HTMLElement>()
  let chartInstance: echarts.ECharts | null = null

  // Dados do gráfico
  const chartData = ref({
    dates: [] as string[],
    approved: [] as number[],
    denied: [] as number[],
  })

  console.log(props)
  // Configuração do gráfico
  const chartOption = computed(() => ({
    title: {
      text: 'Acessos por Tipo (Últimos 30 dias)',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['Aprovados', 'Negados'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.dates,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Quantidade de Acessos',
    },
    series: [
      {
        name: 'Aprovados',
        type: 'line',
        data: chartData.value.approved,
        itemStyle: {
          color: '#4CAF50',
        },
        lineStyle: {
          color: '#4CAF50',
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(76, 175, 80, 0.3)' },
              { offset: 1, color: 'rgba(76, 175, 80, 0.1)' },
            ],
          },
        },
        smooth: true,
      },
      {
        name: 'Negados',
        type: 'line',
        data: chartData.value.denied,
        itemStyle: {
          color: '#F44336',
        },
        lineStyle: {
          color: '#F44336',
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(244, 67, 54, 0.3)' },
              { offset: 1, color: 'rgba(244, 67, 54, 0.1)' },
            ],
          },
        },
        smooth: true,
      },
    ],
  }))

  // Processar dados dos logs recebidos via props
  const processLogData = () => {
    try {
      // Combinar logs aprovados e negados
      const allLogs = [...props.approvedLogs, ...props.rejectedLogs]

      // Agrupar logs por data e tipo
      const groupedData = new Map<string, { approved: number; denied: number }>()

      for (const log of allLogs) {
        const date = new Date(log.time).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })

        if (!groupedData.has(date)) {
          groupedData.set(date, { approved: 0, denied: 0 })
        }

        const dayData = groupedData.get(date)!

        // Classificar por tipo de evento
        switch (log.event_type) {
          case 7: { // Acesso Concedido
            dayData.approved++
            break
          }
          case 6: { // Acesso Negado
            dayData.denied++
            break
          }
        }
      }

      // Ordenar por data
      const sortedDates = Array.from(groupedData.keys()).sort((a, b) => {
        const dateA = new Date(a.split('/').reverse().join('-'))
        const dateB = new Date(b.split('/').reverse().join('-'))
        return dateA.getTime() - dateB.getTime()
      })

      // Preparar dados para o gráfico
      chartData.value = {
        dates: sortedDates,
        approved: sortedDates.map(date => groupedData.get(date)?.approved || 0),
        denied: sortedDates.map(date => groupedData.get(date)?.denied || 0),
      }

      updateChart()
    } catch (error) {
      console.error('Erro ao processar dados do gráfico:', error)
    }
  }

  // Atualizar gráfico
  const updateChart = () => {
    if (chartInstance) {
      chartInstance.setOption(chartOption.value)
    }
  }

  // Inicializar gráfico
  const initChart = () => {
    if (chartRef.value) {
      chartInstance = echarts.init(chartRef.value)
      chartInstance.setOption(chartOption.value)

      // Responsividade
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    }
  }

  // Watch para mudanças nos props
  watch(() => [props.approvedLogs, props.rejectedLogs], () => {
    processLogData()
  }, { deep: true })

  onMounted(() => {
    processLogData()
    initChart()
  })
</script>

<template>
  <v-card class="pa-4" elevation="2">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-medium">
        <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
        Evolução dos Acessos
      </h3>
      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        size="small"
        variant="outlined"
        @click="processLogData"
      >
        Atualizar
      </v-btn>
    </div>

    <div
      ref="chartRef"
      style="width: 100%; height: 400px;"
    />

    <div class="d-flex justify-center mt-4">
      <div class="d-flex align-center mr-6">
        <div class="mr-2" style="width: 12px; height: 12px; background-color: #4CAF50; border-radius: 2px;"></div>
        <span class="text-caption">Aprovados</span>
      </div>
      <div class="d-flex align-center">
        <div class="mr-2" style="width: 12px; height: 12px; background-color: #F44336; border-radius: 2px;"></div>
        <span class="text-caption">Negados</span>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
  /* Estilos específicos para o gráfico */
  .v-card {
    border-radius: 12px;
  }
</style>
