import type { EChartsOption } from 'echarts'
import { computed, onMounted, ref } from 'vue'

type ProjectMetrics = Record<string, number[]>
type DayBuildData = Record<string, ProjectMetrics>
type ProjectType = 'app' | 'demo' | 'unregistered'

interface DataEntry {
  date: string
  data: DayBuildData
}

interface DataIndexPayload {
  generatedAt?: string
  entryCount?: number
  entries?: DataEntry[]
}

export interface RegistryPayload {
  generatedAt: string
  projectCount: number
  projects: RegistryProject[]
}

export interface RegistryProject {
  id: string
  type: 'app' | 'demo'
  typeLabel: string
  packageName: string | null
  displayName: string
  benchmarkKey: string
  buildScript: string | null
  hasBuildScript: boolean
}

export interface ProjectMeta extends Omit<RegistryProject, 'type'> {
  type: ProjectType
}

export interface ProjectDataset {
  meta: ProjectMeta
  series: (number | null)[]
}

export interface ProjectStat {
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

export interface MonthChangeStat {
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

interface RangeLabels {
  current: string
  previous: string
}

interface DateRange {
  start: number
  end: number
}

const monthWindowDays = 30
const dayMs = 24 * 60 * 60 * 1000

const roundToTwo = (value: number) => Math.round(value * 100) / 100
function formatValueLabel(value: number | null) {
  return value == null ? '--' : `${value.toFixed(2)} ms`
}
function formatSignedLabel(value: number | null, suffix: string) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }
  const formatted = value.toFixed(2)
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${formatted} ${suffix}`
}
function average(values: number[]) {
  if (!values.length) {
    return null
  }
  const sum = values.reduce((acc, current) => acc + current, 0)
  return roundToTwo(sum / values.length)
}
function parseDateToUTC(value: string) {
  const [yearStr, monthStr, dayStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null
  }
  return Date.UTC(year, month - 1, day)
}
function formatDateFromUTC(value: number | null) {
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
const isWithinRange = (value: number, range: DateRange) => value >= range.start && value <= range.end

function extractMetricValues(metrics: ProjectMetrics | undefined) {
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
    key => Array.isArray(metrics[key]) && metrics[key].length > 0,
  )
  return firstKey ? metrics[firstKey] : ([] as number[])
}

function normalizeEntries(entries: DataEntry[]) {
  return [...entries]
    .filter(entry => typeof entry?.date === 'string' && entry.date.trim().length > 0 && entry?.data)
    .map(entry => ({ ...entry, date: entry.date.trim() }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function useBenchmarkData(projectRegistry: RegistryPayload) {
  const rawEntries = ref<DataEntry[]>([])
  const loadError = ref<string | null>(null)
  const loading = ref(true)

  const registryProjects: ProjectMeta[] = (projectRegistry.projects ?? []).map(project => ({
    ...project,
    type: project.type,
  }))
  const registrationSummary = {
    total: registryProjects.length,
    apps: registryProjects.filter(project => project.type === 'app').length,
    demos: registryProjects.filter(project => project.type === 'demo').length,
  }

  const metrics = computed(() => {
    const entries = normalizeEntries(rawEntries.value)
    const dates = entries.map(entry => entry.date)
    const dateBuckets = dates.map(label => ({ label, ts: parseDateToUTC(label) }))
    const validDateBuckets = dateBuckets.filter(bucket => bucket.ts != null)
    const projectSeriesMap = new Map<string, (number | null)[]>()
    const projectMetaMap = new Map<string, ProjectMeta>()
    const fallbackProjects: ProjectMeta[] = []

    const ensureSeries = (key: string) => {
      if (!projectSeriesMap.has(key)) {
        projectSeriesMap.set(
          key,
          Array.from({ length: dates.length }, () => null as number | null),
        )
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

    entries.forEach((entry, dateIdx) => {
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
      .map(meta => ({
        meta,
        series: ensureSeries(meta.benchmarkKey),
      }))

    return {
      dates,
      dateBuckets,
      earliestDate: dates[0] ?? '',
      latestDate: dates.length ? dates[dates.length - 1] : '',
      latestDateMs: validDateBuckets.length
        ? validDateBuckets[validDateBuckets.length - 1]?.ts ?? null
        : null,
      sampleCount: dates.length,
      projectDatasets,
      fallbackProjects,
      unregisteredCount: fallbackProjects.length,
    }
  })

  const dates = computed(() => metrics.value.dates)
  const dateBuckets = computed(() => metrics.value.dateBuckets)
  const earliestDate = computed(() => metrics.value.earliestDate)
  const latestDate = computed(() => metrics.value.latestDate)
  const latestDateMs = computed(() => metrics.value.latestDateMs)
  const sampleCount = computed(() => metrics.value.sampleCount)
  const projectDatasets = computed(() => metrics.value.projectDatasets)
  const unregisteredCount = computed(() => metrics.value.unregisteredCount)

  const chartSeriesSources = computed(() =>
    projectDatasets.value.filter(dataset => dataset.series.some(value => value != null)),
  )

  const hasData = computed(() => chartSeriesSources.value.length > 0)

  const findLastIndex = <T>(
    arr: readonly T[],
    predicate: (value: T, index: number, obj: readonly T[]) => boolean,
  ) => {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (predicate(arr[i], i, arr)) {
        return i
      }
    }
    return -1
  }

  const projectStats = computed<ProjectStat[]>(() =>
    projectDatasets.value
      .map(({ meta, series }) => {
        const firstIdx = series.findIndex(value => value != null)
        const lastIdx = findLastIndex(series, value => value != null)
        if (firstIdx === -1 || lastIdx === -1) {
          return null
        }
        const firstValue = series[firstIdx]
        const lastValue = series[lastIdx]
        if (firstValue == null || lastValue == null) {
          return null
        }
        const diff = roundToTwo(lastValue - firstValue)
        const percent
          = firstValue !== 0 ? roundToTwo(((lastValue - firstValue) / firstValue) * 100) : null
        const trendClass
          = diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-rose-400' : 'text-slate-300'
        return {
          meta,
          firstDate: dates.value[firstIdx],
          lastDate: dates.value[lastIdx],
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
    if (latestDateMs.value == null) {
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
      start: latestDateMs.value - (monthWindowDays - 1) * dayMs,
      end: latestDateMs.value,
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

  const rangeLabels = computed<RangeLabels>(() => rangeInfo.value.labels)

  const monthChangeStats = computed<MonthChangeStat[]>(() => {
    const { currentRange, previousRange } = rangeInfo.value
    if (!currentRange || !previousRange) {
      return []
    }
    return projectDatasets.value
      .map(({ meta, series }) => {
        const entries = series
          .map((value, idx) => {
            const ts = dateBuckets.value[idx]?.ts
            return value != null && ts != null ? { value, ts } : null
          })
          .filter((entry): entry is { value: number, ts: number } => entry !== null)
        const previousValues = entries
          .filter(entry => isWithinRange(entry.ts, previousRange))
          .map(entry => entry.value)
        const currentValues = entries
          .filter(entry => isWithinRange(entry.ts, currentRange))
          .map(entry => entry.value)
        if (!previousValues.length && !currentValues.length) {
          return null
        }
        const previousAvg = average(previousValues)
        const currentAvg = average(currentValues)
        const diff
          = currentAvg != null && previousAvg != null ? roundToTwo(currentAvg - previousAvg) : null
        const percent
          = currentAvg != null && previousAvg != null && previousAvg !== 0
            ? roundToTwo(((currentAvg - previousAvg) / previousAvg) * 100)
            : null
        const trendClass
          = diff == null
            ? 'text-slate-400'
            : diff < 0
              ? 'text-emerald-400'
              : diff > 0
                ? 'text-rose-400'
                : 'text-slate-300'
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
      .filter(stat => stat.diff != null)
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
      valueFormatter: value => (typeof value === 'number' ? `${value.toFixed(2)} ms` : ''),
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
        start: Math.max(0, 100 - Math.round((10 / Math.max(sampleCount.value, 1)) * 100)),
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
      data: dates.value,
      axisLabel: {
        color: '#9ca3af',
        rotate: dates.value.length > 20 ? 45 : 0,
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
          const dataIndex
            = payload && typeof payload.dataIndex === 'number' ? payload.dataIndex : 0
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
        data: monthDeltaLeaders.value.map(stat => stat.meta.displayName),
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
          data: monthDeltaLeaders.value.map(stat => stat.diff ?? 0),
          itemStyle: {
            color: params =>
              typeof params.value === 'number' && params.value < 0 ? '#34d399' : '#f87171',
          },
          label: {
            show: true,
            position: 'right',
            color: '#e5e7eb',
            formatter: params => `${Number(params.value).toFixed(2)} ms`,
          },
        },
      ],
    }
  })

  async function fetchDataIndex() {
    try {
      const response = await fetch('/data/index.json', { cache: 'no-cache' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const payload = (await response.json()) as DataIndexPayload
      const entries = Array.isArray(payload?.entries) ? payload.entries : []
      rawEntries.value = normalizeEntries(entries)
    }
    catch (error: any) {
      loadError.value = error?.message ?? String(error)
      rawEntries.value = []
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchDataIndex()
  })

  return {
    monthWindowDays,
    loading,
    loadError,
    registrationSummary,
    earliestDate,
    latestDate,
    sampleCount,
    unregisteredCount,
    hasData,
    chartOption,
    monthDeltaChartOption,
    monthDeltaLeaders,
    monthChangeStats,
    projectStats,
    rangeLabels,
  }
}
