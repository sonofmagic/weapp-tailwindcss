<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
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
import projectRegistryJson from '../projects.generated.json'

type ProjectMetrics = Record<string, number[]>
type DayBuildData = Record<string, ProjectMetrics>
type ProjectType = 'app' | 'demo' | 'unregistered'

interface RegistryPayload {
  generatedAt: string
  projectCount: number
  projects: RegistryProject[]
}

interface RegistryProject {
  id: string
  type: 'app' | 'demo'
  typeLabel: string
  packageName: string | null
  displayName: string
  benchmarkKey: string
  buildScript: string | null
  hasBuildScript: boolean
}

interface ProjectMeta extends Omit<RegistryProject, 'type'> {
  type: ProjectType
}

interface ProjectDataset {
  meta: ProjectMeta
  series: (number | null)[]
}

interface ProjectStat {
  meta: ProjectMeta
  firstDate: string
  lastDate: string
  firstValueLabel: string
  lastValueLabel: string
  diffLabel: string
  percentLabel: string
  trendClass: string
  sampleCount: number
}

interface MonthChangeStat {
  meta: ProjectMeta
  previousLabel: string
  currentLabel: string
  diffLabel: string
  percentLabel: string
  trendClass: string
  previousSamples: number
  currentSamples: number
  diff: number | null
}

interface DateRange {
  start: number
  end: number
}

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent])

const monthWindowDays = 30
const dayMs = 24 * 60 * 60 * 1000

const roundToTwo = (value: number) => Math.round(value * 100) / 100
const formatValueLabel = (value: number | null) =>
  value == null ? '--' : `${value.toFixed(2)} ms`
const formatSignedLabel = (value: number | null, suffix: string) => {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }
  const formatted = value.toFixed(2)
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${formatted} ${suffix}`
}
const average = (values: number[]) => {
  if (!values.length) {
    return null
  }
  const sum = values.reduce((acc, current) => acc + current, 0)
  return roundToTwo(sum / values.length)
}
const parseDateToUTC = (value: string) => {
  const [yearStr, monthStr, dayStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null
  }
  return Date.UTC(year, month - 1, day)
}
const formatDateFromUTC = (value: number | null) => {
  if (value == null) {
    return '--'
  }
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) {
    return '--'
  }
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const isWithinRange = (value: number, range: DateRange) =>
  value >= range.start && value <= range.end

const extractMetricValues = (metrics: ProjectMetrics | undefined) => {
  if (!metrics) {
    return [] as number[]
  }
  const priorities = ['build', 'babel']
  for (const key of priorities) {
    const candidate = metrics[key]
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate
    }
  }
  const firstKey = Object.keys(metrics).find(
    (key) => Array.isArray(metrics[key]) && metrics[key].length > 0,
  )
  return firstKey ? metrics[firstKey] : ([] as number[])
}

const projectRegistry = projectRegistryJson as RegistryPayload
const registryProjects: ProjectMeta[] = (projectRegistry.projects ?? []).map((project) => ({
  ...project,
  type: project.type,
}))
const registrationSummary = {
  total: registryProjects.length,
  apps: registryProjects.filter((project) => project.type === 'app').length,
  demos: registryProjects.filter((project) => project.type === 'demo').length,
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
const dateBuckets = dates.map((label) => ({ label, ts: parseDateToUTC(label) }))
const validDateBuckets = dateBuckets.filter((bucket) => bucket.ts != null)
const earliestDate = dates[0] ?? ''
const latestDate = dates.length ? dates[dates.length - 1] : ''
const latestDateMs = validDateBuckets.length
  ? validDateBuckets[validDateBuckets.length - 1]?.ts ?? null
  : null
const sampleCount = dates.length

const projectSeriesMap = new Map<string, (number | null)[]>()
const projectMetaMap = new Map<string, ProjectMeta>()
const fallbackProjects: ProjectMeta[] = []

const ensureSeries = (key: string) => {
  if (!projectSeriesMap.has(key)) {
    projectSeriesMap.set(key, Array(dates.length).fill(null))
  }
  return projectSeriesMap.get(key)!
}
const ensureProjectMeta = (key: string) => {
  const existing = projectMetaMap.get(key)
  if (existing) {
    return existing
  }
  const fallback: ProjectMeta = {
    id: key,
    type: 'unregistered',
    typeLabel: '未注册',
    packageName: null,
    displayName: key,
    benchmarkKey: key,
    buildScript: null,
    hasBuildScript: false,
  }
  projectMetaMap.set(key, fallback)
  fallbackProjects.push(fallback)
  return fallback
}

registryProjects.forEach((project) => {
  projectMetaMap.set(project.benchmarkKey, project)
  ensureSeries(project.benchmarkKey)
})

rawEntries.forEach((entry, dateIdx) => {
  Object.entries(entry.data).forEach(([projectKey, metrics]) => {
    const meta = ensureProjectMeta(projectKey)
    const series = ensureSeries(meta.benchmarkKey)
    const values = extractMetricValues(metrics)
    if (!values.length) {
      return
    }
    const avg = values.reduce((sum, current) => sum + current, 0) / values.length
    series[dateIdx] = roundToTwo(avg)
  })
})

const unregisteredCount = fallbackProjects.length
const typeOrder: Record<ProjectType, number> = {
  app: 0,
  demo: 1,
  unregistered: 2,
}
const collator = new Intl.Collator('zh-Hans-CN')
const projectDatasets: ProjectDataset[] = [...projectMetaMap.values()]
  .sort((a, b) => {
    if (a.type === b.type) {
      return collator.compare(a.displayName, b.displayName)
    }
    return typeOrder[a.type] - typeOrder[b.type]
  })
  .map((meta) => ({
    meta,
    series: ensureSeries(meta.benchmarkKey),
  }))

const chartSeriesSources = computed(() =>
  projectDatasets.filter((dataset) => dataset.series.some((value) => value != null)),
)

const hasData = computed(() => chartSeriesSources.value.length > 0)

const findLastIndex = <T>(arr: readonly T[], predicate: (value: T, index: number, obj: readonly T[]) => boolean) => {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (predicate(arr[i], i, arr)) {
      return i
    }
  }
  return -1
}

const projectStats = computed<ProjectStat[]>(() =>
  projectDatasets
    .map(({ meta, series }) => {
      const firstIdx = series.findIndex((value) => value != null)
      const lastIdx = findLastIndex(series, (value) => value != null)
      if (firstIdx === -1 || lastIdx === -1) {
        return null
      }
      const firstValue = series[firstIdx]
      const lastValue = series[lastIdx]
      if (firstValue == null || lastValue == null) {
        return null
      }
      const diff = roundToTwo(lastValue - firstValue)
      const percent =
        firstValue !== 0 ? roundToTwo(((lastValue - firstValue) / firstValue) * 100) : null
      const trendClass =
        diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-rose-400' : 'text-slate-300'
      return {
        meta,
        firstDate: dates[firstIdx],
        lastDate: dates[lastIdx],
        firstValueLabel: formatValueLabel(firstValue),
        lastValueLabel: formatValueLabel(lastValue),
        diffLabel: formatSignedLabel(diff, 'ms'),
        percentLabel: formatSignedLabel(percent, '%'),
        trendClass,
        sampleCount: series.filter((value): value is number => value != null).length,
      }
    })
    .filter((stat): stat is ProjectStat => stat !== null),
)

const rangeInfo = computed(() => {
  if (latestDateMs == null) {
    return {
      currentRange: null,
      previousRange: null,
      labels: {
        current: '--',
        previous: '--',
      },
    }
  }
  const currentRange: DateRange = {
    start: latestDateMs - (monthWindowDays - 1) * dayMs,
    end: latestDateMs,
  }
  const previousRange: DateRange = {
    start: currentRange.start - monthWindowDays * dayMs,
    end: currentRange.start - dayMs,
  }
  return {
    currentRange,
    previousRange,
    labels: {
      current: `${formatDateFromUTC(currentRange.start)} - ${formatDateFromUTC(currentRange.end)}`,
      previous: `${formatDateFromUTC(previousRange.start)} - ${formatDateFromUTC(previousRange.end)}`,
    },
  }
})

const rangeLabels = computed(() => rangeInfo.value.labels)

const monthChangeStats = computed<MonthChangeStat[]>(() => {
  const { currentRange, previousRange } = rangeInfo.value
  if (!currentRange || !previousRange) {
    return []
  }
  return projectDatasets
    .map(({ meta, series }) => {
      const entries = series
        .map((value, idx) => {
          const ts = dateBuckets[idx]?.ts
          return value != null && ts != null ? { value, ts } : null
        })
        .filter((entry): entry is { value: number; ts: number } => entry !== null)
      const previousValues = entries
        .filter((entry) => isWithinRange(entry.ts, previousRange))
        .map((entry) => entry.value)
      const currentValues = entries
        .filter((entry) => isWithinRange(entry.ts, currentRange))
        .map((entry) => entry.value)
      if (!previousValues.length && !currentValues.length) {
        return null
      }
      const previousAvg = average(previousValues)
      const currentAvg = average(currentValues)
      const diff =
        currentAvg != null && previousAvg != null ? roundToTwo(currentAvg - previousAvg) : null
      const percent =
        currentAvg != null && previousAvg != null && previousAvg !== 0
          ? roundToTwo(((currentAvg - previousAvg) / previousAvg) * 100)
          : null
      const trendClass =
        diff == null ? 'text-slate-400' : diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-rose-400' : 'text-slate-300'
      return {
        meta,
        previousLabel: formatValueLabel(previousAvg),
        currentLabel: formatValueLabel(currentAvg),
        diffLabel: formatSignedLabel(diff, 'ms'),
        percentLabel: formatSignedLabel(percent, '%'),
        previousSamples: previousValues.length,
        currentSamples: currentValues.length,
        diff,
        trendClass,
      }
    })
    .filter((stat): stat is MonthChangeStat => stat !== null)
})

const monthDeltaLeaders = computed(() =>
  [...monthChangeStats.value]
    .filter((stat) => stat.diff != null)
    .sort((a, b) => Math.abs(b.diff ?? 0) - Math.abs(a.diff ?? 0))
    .slice(0, 12),
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
  series: chartSeriesSources.value.map(({ meta, series }) => ({
    name: meta.displayName,
    type: 'line',
    smooth: true,
    showSymbol: false,
    connectNulls: false,
    data: series,
  })),
}))

const monthDeltaChartOption = computed<EChartsOption>(() => {
  if (!monthDeltaLeaders.value.length) {
    return {}
  }
  return {
    title: {
      text: '最近 30 天 vs 上一周期 平均耗时变化（Top 12）',
      left: 'center',
      textStyle: {
        color: '#cbd5f5',
        fontSize: 17,
        fontWeight: 500,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const payload = Array.isArray(params) ? params[0] : params
        const dataIndex =
          payload && typeof payload.dataIndex === 'number' ? payload.dataIndex : 0
        const stat = monthDeltaLeaders.value[dataIndex] ?? monthDeltaLeaders.value[0]
        if (!stat) {
          return ''
        }
        return [
          `${stat.meta.displayName}`,
          `上一周期：${stat.previousLabel}`,
          `最近周期：${stat.currentLabel}`,
          `变化：${stat.diffLabel}`,
          `变化率：${stat.percentLabel}`,
        ].join('<br/>')
      },
    },
    grid: {
      left: 80,
      right: 40,
      top: 80,
      bottom: 40,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#9ca3af',
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#374151',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: monthDeltaLeaders.value.map((stat) => stat.meta.displayName),
      axisLabel: {
        color: '#cbd5f5',
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
    },
    series: [
      {
        type: 'bar',
        data: monthDeltaLeaders.value.map((stat) => stat.diff ?? 0),
        itemStyle: {
          color: (params) => (typeof params.value === 'number' && params.value < 0 ? '#34d399' : '#f87171'),
        },
        label: {
          show: true,
          position: 'right',
          color: '#e5e7eb',
          formatter: (params) => `${Number(params.value).toFixed(2)} ms`,
        },
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <section class="space-y-2">
        <h1 class="text-2xl font-semibold">构建速度趋势</h1>
        <p class="text-sm text-slate-400">
          数据范围: {{ earliestDate || '无数据' }} - {{ latestDate || '无数据' }}，共 {{ sampleCount }} 次采样。
        </p>
        <p class="text-sm text-slate-400">
          已登记 {{ registrationSummary.total }} 个项目（应用 {{ registrationSummary.apps }}，示例 {{ registrationSummary.demos }}），未登记但存在历史数据 {{ unregisteredCount }} 个。
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

      <section class="space-y-6 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/30">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 class="text-lg font-medium">30 天滚动窗口平均耗时对比</h2>
            <p class="text-xs text-slate-400">
              最近窗口：{{ rangeLabels.current }} · 上一窗口：{{ rangeLabels.previous }} · 窗口宽度：{{ monthWindowDays }} 天
            </p>
          </div>
          <div class="text-xs text-slate-400">
            参与统计项目：{{ monthChangeStats.length }}
          </div>
        </div>
        <div v-if="monthDeltaLeaders.length">
          <VChart class="h-[460px] w-full" :option="monthDeltaChartOption" autoresize />
        </div>
        <div
          v-else
          class="rounded-lg border border-slate-800/60 bg-slate-900/40 p-6 text-center text-sm text-slate-400"
        >
          需要至少两个完整时间窗口的构建数据才能计算月度变化。
        </div>
        <div v-if="monthChangeStats.length" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-800 text-sm">
            <thead class="text-left text-slate-400">
              <tr>
                <th class="py-2 pr-4 font-normal">项目</th>
                <th class="py-2 pr-4 font-normal text-right">上一周期</th>
                <th class="py-2 pr-4 font-normal text-right">最近周期</th>
                <th class="py-2 pr-4 font-normal text-right">变化</th>
                <th class="py-2 pr-4 font-normal text-right">变化率</th>
                <th class="py-2 pr-4 font-normal text-right">样本 (旧→新)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr
                v-for="stat in monthChangeStats"
                :key="stat.meta.benchmarkKey"
                class="transition-colors duration-150 hover:bg-slate-800/40"
              >
                <td class="py-3 pr-4 align-top">
                  <div class="font-medium">{{ stat.meta.displayName }}</div>
                  <div class="text-xs text-slate-400">{{ stat.meta.typeLabel }}</div>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <div class="font-mono">{{ stat.previousLabel }}</div>
                  <div class="text-xs text-slate-500">样本: {{ stat.previousSamples }}</div>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <div class="font-mono">{{ stat.currentLabel }}</div>
                  <div class="text-xs text-slate-500">样本: {{ stat.currentSamples }}</div>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <span :class="stat.trendClass">{{ stat.diffLabel }}</span>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <span :class="stat.trendClass">{{ stat.percentLabel }}</span>
                </td>
                <td class="py-3 pr-4 text-right align-top">
                  <div class="text-xs text-slate-400">{{ stat.previousSamples }} → {{ stat.currentSamples }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
                :key="stat.meta.benchmarkKey"
                class="transition-colors duration-150 hover:bg-slate-800/40"
              >
                <td class="py-3 pr-4 align-top">
                  <div class="font-medium">{{ stat.meta.displayName }}</div>
                  <div class="text-xs text-slate-400">{{ stat.meta.typeLabel }} · 样本数: {{ stat.sampleCount }}</div>
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
