<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

type ProjectMetrics = Record<string, number[]>
type DayBuildData = Record<string, ProjectMetrics>

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent])

const roundToTwo = (value: number) => Math.round(value * 100) / 100

const findLastIndex = <T>(arr: readonly T[], predicate: (value: T, index: number, obj: readonly T[]) => boolean) => {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (predicate(arr[i], i, arr)) {
      return i
    }
  }
  return -1
}

const extractMetricValues = (metrics: ProjectMetrics | undefined) => {
  if (!metrics) {
    return [] as number[]
  }
  if (Array.isArray(metrics.babel) && metrics.babel.length > 0) {
    return metrics.babel
  }
  const firstKey = Object.keys(metrics).find((key) => Array.isArray(metrics[key]) && metrics[key].length > 0)
  return firstKey ? metrics[firstKey] : ([] as number[])
}

const rawModules = import.meta.glob<DayBuildData>('/data/*.json', {
  eager: true,
  import: 'default',
})

const rawEntries = Object.entries(rawModules)
  .map(([path, data]) => {
    const filename = path.split('/').pop()
    const date = filename ? filename.replace('.json', '') : ''
    return { date, data }
  })
  .filter((entry) => Boolean(entry.date))
  .sort((a, b) => a.date.localeCompare(b.date))

const dates = rawEntries.map((entry) => entry.date)
const projectNames = new Set<string>()
rawEntries.forEach((entry) => {
  Object.keys(entry.data).forEach((name) => projectNames.add(name))
})

const projectSeriesMap = new Map<string, (number | null)[]>()
projectNames.forEach((name) => {
  projectSeriesMap.set(name, Array(dates.length).fill(null))
})

rawEntries.forEach((entry, dateIdx) => {
  Object.entries(entry.data).forEach(([project, metrics]) => {
    const values = extractMetricValues(metrics)
    if (!values.length) {
      return
    }
    const series = projectSeriesMap.get(project)
    if (!series) {
      return
    }
    const avg = values.reduce((sum, current) => sum + current, 0) / values.length
    series[dateIdx] = roundToTwo(avg)
  })
})

const collator = new Intl.Collator('zh-Hans-CN')
const sortedProjects = [...projectSeriesMap.entries()].sort((a, b) => collator.compare(a[0], b[0]))

const earliestDate = dates[0] ?? ''
const latestDate = dates.length ? dates[dates.length - 1] : ''
const sampleCount = dates.length
const hasData = computed(() =>
  sortedProjects.some(([, dataset]) => dataset.some((value) => value != null))
)

interface ProjectStat {
  name: string
  firstDate: string
  lastDate: string
  firstValueLabel: string
  lastValueLabel: string
  diffLabel: string
  percentLabel: string
  trendClass: string
  sampleCount: number
}

const projectStats = computed<ProjectStat[]>(() =>
  sortedProjects
    .map(([name, dataset]) => {
      const firstIdx = dataset.findIndex((value) => value != null)
      const lastIdx = findLastIndex(dataset, (value) => value != null)
      if (firstIdx === -1 || lastIdx === -1) {
        return null
      }
      const firstValue = dataset[firstIdx]
      const lastValue = dataset[lastIdx]
      if (firstValue == null || lastValue == null) {
        return null
      }
      const diff = roundToTwo(lastValue - firstValue)
      const percent =
        firstValue !== 0 ? roundToTwo(((lastValue - firstValue) / firstValue) * 100) : null
      const trendClass =
        diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-rose-400' : 'text-slate-300'
      const valueLabel = (value: number) => `${value.toFixed(2)} ms`
      const signedLabel = (value: number | null, suffix: string) => {
        if (value == null) {
          return '--'
        }
        const formatted = value.toFixed(2)
        const prefix = value > 0 ? '+' : ''
        return `${prefix}${formatted} ${suffix}`
      }
      const usablePercentLabel = percent == null ? '--' : signedLabel(percent, '%')
      const usableDiffLabel = signedLabel(diff, 'ms')
      return {
        name,
        firstDate: dates[firstIdx],
        lastDate: dates[lastIdx],
        firstValueLabel: valueLabel(firstValue),
        lastValueLabel: valueLabel(lastValue),
        diffLabel: usableDiffLabel,
        percentLabel: usablePercentLabel,
        trendClass,
        sampleCount: dataset.filter((value): value is number => value != null).length,
      }
    })
    .filter((stat): stat is ProjectStat => stat !== null)
)

const chartOption = computed<EChartsOption>(() => ({
  title: {
    text: '构建耗时趋势',
    left: 'center',
    textStyle: {
      color: '#cbd5f5',
      fontSize: 18,
      fontWeight: 500,
    },
  },
  tooltip: {
    trigger: 'axis',
    valueFormatter: (value) => (typeof value === 'number' ? `${value.toFixed(2)} ms` : ''),
  },
  legend: {
    type: 'scroll',
    bottom: 0,
    textStyle: {
      color: '#cbd5f5',
    },
  },
  grid: {
    left: 60,
    right: 24,
    top: 70,
    bottom: 110,
  },
  dataZoom: [
    {
      type: 'slider',
      start: Math.max(0, 100 - Math.round((10 / Math.max(sampleCount, 1)) * 100)),
      end: 100,
      bottom: 60,
    },
    {
      type: 'inside',
    },
  ],
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dates,
    axisLabel: {
      color: '#9ca3af',
      rotate: dates.length > 20 ? 45 : 0,
      formatter: (value: string) => value.slice(5),
    },
    axisLine: {
      lineStyle: {
        color: '#4b5563',
      },
    },
  },
  yAxis: {
    type: 'value',
    name: '耗时 (ms)',
    nameTextStyle: {
      color: '#9ca3af',
      padding: [0, 0, 0, -40],
    },
    axisLabel: {
      color: '#9ca3af',
    },
    splitLine: {
      lineStyle: {
        color: '#374151',
      },
    },
  },
  series: sortedProjects.map(([name, dataset]) => ({
    name,
    type: 'line',
    smooth: true,
    showSymbol: false,
    connectNulls: false,
    data: dataset,
  })),
}))
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <section class="space-y-2">
        <h1 class="text-2xl font-semibold">构建速度趋势</h1>
        <p class="text-sm text-slate-400">
          数据范围: {{ earliestDate || '无数据' }} - {{ latestDate || '无数据' }}，共 {{ sampleCount }} 次采样。
        </p>
      </section>

      <section
        v-if="hasData"
        class="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/30"
      >
        <VChart class="h-[520px] w-full" :option="chartOption" autoresize />
      </section>
      <section
        v-else
        class="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 text-center text-slate-300"
      >
        暂无构建数据，请先运行基准测试采集结果。
      </section>

      <section
        v-if="projectStats.length"
        class="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/30"
      >
        <h2 class="mb-4 text-lg font-medium">起始 vs 最新构建耗时对比</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-800 text-sm">
            <thead class="text-left text-slate-400">
              <tr>
                <th class="py-2 pr-4 font-normal">项目</th>
                <th class="py-2 pr-4 font-normal text-right">起始耗时</th>
                <th class="py-2 pr-4 font-normal text-right">最新耗时</th>
                <th class="py-2 pr-4 font-normal text-right">变化</th>
                <th class="py-2 pr-4 font-normal text-right">变化率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr
                v-for="stat in projectStats"
                :key="stat.name"
                class="transition-colors duration-150 hover:bg-slate-800/40"
              >
                <td class="py-3 pr-4 align-top">
                  <div class="font-medium">{{ stat.name }}</div>
                  <div class="text-xs text-slate-400">样本数: {{ stat.sampleCount }}</div>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <div class="font-mono">{{ stat.firstValueLabel }}</div>
                  <div class="text-xs text-slate-400">{{ stat.firstDate }}</div>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <div class="font-mono">{{ stat.lastValueLabel }}</div>
                  <div class="text-xs text-slate-400">{{ stat.lastDate }}</div>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <span :class="stat.trendClass">{{ stat.diffLabel }}</span>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <span :class="stat.trendClass">{{ stat.percentLabel }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
