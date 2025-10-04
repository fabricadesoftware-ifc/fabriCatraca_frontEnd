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
      text: 'Acessos por Hora',
      subtext: 'Histórico das últimas 24 horas',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
      },
      subtextStyle: {
        fontSize: 12,
        color: '#666666',
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
        const [date, time] = data.name.split(' ')
        const [day, month] = date.split('/')
        return `${day}/${month} às ${time}<br/>
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
        formatter: (value: string) => {
          const [_date, time] = value.split(' ')
          return `${time}h`
        },
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

  // Gerar intervalo de datas para as últimas 24 horas
  function generateDateRange () {
    const dates = []
    const end = new Date()
    const start = new Date()
    start.setUTCHours(end.getUTCHours() - 24)

    // Ajusta para o início da hora
    start.setUTCMinutes(0)
    start.setUTCSeconds(0)
    start.setUTCMilliseconds(0)

    // Gera um ponto a cada hora
    for (let d = new Date(start); d <= end; d.setUTCHours(d.getUTCHours() + 1)) {
      const day = String(d.getUTCDate()).padStart(2, '0')
      const month = String(d.getUTCMonth() + 1).padStart(2, '0')
      const hour = String(d.getUTCHours()).padStart(2, '0')
      const minute = String(d.getUTCMinutes()).padStart(2, '0')
      const dateStr = `${day}/${month}, ${hour}:${minute}`
      dates.push(dateStr)
    }

    return dates
  }

  // Processar dados dos logs recebidos via props
  function processLogData () {
    try {
      console.log('🔍 Processando logs:', {
        aprovados: props.approvedLogs,
        negados: props.rejectedLogs,
        totalAprovados: props.approvedLogs?.length || 0,
        totalNegados: props.rejectedLogs?.length || 0,
        tipoAprovados: typeof props.approvedLogs,
        tipoNegados: typeof props.rejectedLogs,
      })

      // Verificar se temos dados válidos
      if (!Array.isArray(props.approvedLogs) && !Array.isArray(props.rejectedLogs)) {
        console.warn('⚠️ Nenhum array de logs válido recebido')
      }

      // Inicializar dados com zeros para todas as horas das últimas 24 horas
      const groupedData = new Map<string, { approved: number, denied: number }>()

      // Preencher com zeros para todas as horas
      for (const dateTime of generateDateRange()) {
        groupedData.set(dateTime, { approved: 0, denied: 0 })
      }

      // Processar logs aprovados
      if (props.approvedLogs) {
        for (const log of props.approvedLogs) {
          const date = new Date(log.time)
          const day = String(date.getUTCDate()).padStart(2, '0')
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const hour = String(date.getUTCHours()).padStart(2, '0')
          const minute = String(date.getUTCMinutes()).padStart(2, '0')
          const dateTime = `${day}/${month}, ${hour}:${minute}`

          console.log('Log aprovado:', {
            original: log.time,
            convertido: dateTime,
          })

          const data = groupedData.get(dateTime) || { approved: 0, denied: 0 }
          data.approved++
          groupedData.set(dateTime, data)
        }
      }

      // Processar logs negados
      if (props.rejectedLogs) {
        for (const log of props.rejectedLogs) {
          const date = new Date(log.time)
          const day = String(date.getUTCDate()).padStart(2, '0')
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const hour = String(date.getUTCHours()).padStart(2, '0')
          const minute = String(date.getUTCMinutes()).padStart(2, '0')
          const dateTime = `${day}/${month}, ${hour}:${minute}`

          console.log('Log negado:', {
            original: log.time,
            convertido: dateTime,
          })

          const data = groupedData.get(dateTime) || { approved: 0, denied: 0 }
          data.denied++
          groupedData.set(dateTime, data)
        }
      }

      console.log('Dados agrupados:', Object.fromEntries(groupedData))

      // Ordenar por data/hora
      const sortedDates = Array.from(groupedData.keys()).slice().sort((a: string, b: string) => {
        // Formato: "dd/MM, HH:mm"
        const [dateA, timeA] = a.split(', ')
        const [dateB, timeB] = b.split(', ')

        const [dayA, monthA] = dateA.split('/')
        const [dayB, monthB] = dateB.split('/')

        // Assumir ano atual
        const year = new Date().getUTCFullYear()
        const dateStrA = `${year}-${monthA}-${dayA}T${timeA}:00Z`
        const dateStrB = `${year}-${monthB}-${dayB}T${timeB}:00Z`

        return new Date(dateStrA).getTime() - new Date(dateStrB).getTime()
      })

      // Preparar dados para o gráfico
      chartData.value = {
        dates: sortedDates,
        approved: sortedDates.map((date: string) => groupedData.get(date)?.approved || 0),
        denied: sortedDates.map((date: string) => groupedData.get(date)?.denied || 0),
      }

      updateChart()
    } catch (error) {
      console.error('Erro ao processar dados do gráfico:', error)
    }
  }

  // Atualizar gráfico
  function updateChart () {
    if (chartInstance) {
      chartInstance.setOption(chartOption.value)
    }
  }

  // Inicializar gráfico
  function initChart () {
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
        <div class="mr-2" style="width: 12px; height: 12px; background-color: #4CAF50; border-radius: 2px;" />
        <span class="text-caption">Aprovados</span>
      </div>
      <div class="d-flex align-center">
        <div class="mr-2" style="width: 12px; height: 12px; background-color: #F44336; border-radius: 2px;" />
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
