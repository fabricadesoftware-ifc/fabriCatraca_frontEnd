<script setup lang="ts">
  import * as echarts from 'echarts'
  import { computed, onMounted, ref, watch } from 'vue'
  import type { AccessLogs } from '@/types'

  interface Props {
    approvedLogs: AccessLogs[]
    rejectedLogs: AccessLogs[]
  }

  const props = defineProps<Props>()
  const chartRef = ref<HTMLElement>()
  let chartInstance: echarts.ECharts | null = null

  const chartData = ref({
    dates: [] as string[],
    approved: [] as number[],
    denied: [] as number[],
  })

  const chartOption = computed(() => ({
    backgroundColor: '#ffffff',
    title: {
      text: 'Acessos por Hora',
      subtext: 'Historico das ultimas 24 horas',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold', color: '#333333' },
      subtextStyle: { fontSize: 12, color: '#666666' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
          formatter: ({ axisDimension, value }: { axisDimension: string; value: string | number }) => {
            if (axisDimension === 'y') {
              return String(Math.round(Number(value) || 0))
            }

            return String(value)
          },
        },
      },
      formatter: (params: any) => {
        const data = params[0]
        const [date, time] = data.name.split(', ')
        const [day, month] = date.split('/')
        return `${day}/${month} as ${time}<br/>
                <span style="color: #4CAF50;">● Aprovados: ${Math.round(Number(data.value) || 0)}</span><br/>
                <span style="color: #F44336;">● Negados: ${Math.round(Number(params[1]?.value) || 0)}</span>`
      },
    },
    legend: { data: ['Aprovados', 'Negados'], bottom: 10 },
    grid: { left: '8%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.dates,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        color: '#666666',
        formatter: (value: string) => {
          const [, time] = value.split(', ')
          return `${time}h`
        },
      },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
    },
    yAxis: {
      type: 'value',
      name: 'Quantidade de Acessos',
      minInterval: 1,
      nameTextStyle: { color: '#666666' },
      axisLabel: {
        color: '#666666',
        formatter: (value: number) => String(Math.round(value)),
      },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [
      {
        name: 'Aprovados',
        type: 'line',
        data: chartData.value.approved,
        itemStyle: { color: '#4CAF50' },
        lineStyle: { color: '#4CAF50', width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
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
        itemStyle: { color: '#F44336' },
        lineStyle: { color: '#F44336', width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
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

  function formatLocal(date: Date, withMinutes = false): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}, ${hour}:${withMinutes ? minute : '00'}`
  }

  function generateDateRange(): string[] {
    const dates: string[] = []
    const now = new Date()

    const start = new Date(now)
    start.setHours(now.getHours() - 23)
    start.setMinutes(0)
    start.setSeconds(0)
    start.setMilliseconds(0)

    const current = new Date(start)
    while (current.getTime() <= now.getTime()) {
      dates.push(formatLocal(current, false))
      current.setHours(current.getHours() + 1)
    }

    const nowKey = formatLocal(now, true)
    if (dates[dates.length - 1] !== nowKey) {
      dates[dates.length - 1] = nowKey
    }

    return dates
  }

  function isCurrentLocalHour(date: Date, now: Date): boolean {
    return (
      date.getHours() === now.getHours() &&
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }

  function processLogData() {
    try {
      const groupedData = new Map<string, { approved: number; denied: number }>()
      const dateRange = generateDateRange()

      for (const dateTime of dateRange) {
        groupedData.set(dateTime, { approved: 0, denied: 0 })
      }

      const now = new Date()
      const currentHourKey = formatLocal(now, true)

      function getKey(log: AccessLogs): string {
        const date = new Date(log.time)

        if (isCurrentLocalHour(date, now)) {
          return currentHourKey
        }

        return formatLocal(date, false)
      }

      if (props.approvedLogs) {
        for (const log of props.approvedLogs) {
          const key = getKey(log)
          const data = groupedData.get(key) || { approved: 0, denied: 0 }
          data.approved++
          groupedData.set(key, data)
        }
      }

      if (props.rejectedLogs) {
        for (const log of props.rejectedLogs) {
          const key = getKey(log)
          const data = groupedData.get(key) || { approved: 0, denied: 0 }
          data.denied++
          groupedData.set(key, data)
        }
      }

      chartData.value = {
        dates: dateRange,
        approved: dateRange.map((dateLabel) => groupedData.get(dateLabel)?.approved || 0),
        denied: dateRange.map((dateLabel) => groupedData.get(dateLabel)?.denied || 0),
      }

      updateChart()
    } catch (error) {
      console.error('Erro ao processar dados do grafico:', error)
    }
  }

  function updateChart() {
    if (chartInstance) {
      chartInstance.setOption(chartOption.value)
    }
  }

  function initChart() {
    if (chartRef.value) {
      chartInstance = echarts.init(chartRef.value, 'light')

      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    }
  }

  watch(() => [props.approvedLogs, props.rejectedLogs], () => {
    processLogData()
  }, { deep: true })

  onMounted(() => {
    initChart()
    processLogData()
  })
</script>

<template>
  <v-card class="pa-4" elevation="2">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-medium">
        <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
        Evolucao dos Acessos por Hora
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
  .v-card {
    border-radius: 12px;
    background-color: white;
    color: black;
  }
</style>
