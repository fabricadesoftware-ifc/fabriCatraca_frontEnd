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
    backgroundColor: '#ffffff',
    title: {
      text: 'Acessos por Hora (Últimos 30 dias)',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
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
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>
                <span style="color: #4CAF50;">● Aprovados: ${data.value}</span><br/>
                <span style="color: #F44336;">● Negados: ${params[1]?.value || 0}</span>`
      },
    },
    legend: {
      data: ['Aprovados', 'Negados'],
      bottom: 10,
    },
    grid: {
      left: '8%',
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
        color: '#666666',
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Quantidade de Acessos',
      nameTextStyle: {
        color: '#666666',
      },
      axisLabel: {
        color: '#666666',
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
        },
      },
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
      // Combinar logs aprovados e negados (inverter ordem se necessário)
      const allLogs = [...props.approvedLogs, ...props.rejectedLogs].reverse()

      // Agrupar logs por data e hora
      const groupedData = new Map<string, { approved: number; denied: number }>()

      for (const log of allLogs) {
        const date = new Date(log.time)
        const dateTime = date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })

        if (!groupedData.has(dateTime)) {
          groupedData.set(dateTime, { approved: 0, denied: 0 })
        }

        const timeData = groupedData.get(dateTime)!

        // Classificar por tipo de evento
        switch (log.event_type) {
          case 7: { // Acesso Concedido
            timeData.approved++
            break
          }
          case 6: { // Acesso Negado
            timeData.denied++
            break
          }
        }
      }

      // Ordenar por data/hora (mais antigas à esquerda, mais recentes à direita)
      const sortedDates = Array.from(groupedData.keys()).sort((a, b) => {
        const dateA = new Date(a.split(' ')[0].split('/').reverse().join('-') + ' ' + a.split(' ')[1])
        const dateB = new Date(b.split(' ')[0].split('/').reverse().join('-') + ' ' + b.split(' ')[1])
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
      chartInstance = echarts.init(chartRef.value, 'light')
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
        Evolução dos Acessos por Hora
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
    background-color: white;
    color: black;
  }
</style>
