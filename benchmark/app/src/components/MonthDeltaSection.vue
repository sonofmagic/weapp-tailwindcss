<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { VChart } from '../plugins/echarts'
import type { MonthChangeStat } from '../composables/useBenchmarkData'

defineProps<{
  monthWindowDays: number
  rangeLabels: { current: string; previous: string }
  monthDeltaLeaders: MonthChangeStat[]
  monthChangeStats: MonthChangeStat[]
  chartOption: EChartsOption
}>()
</script>

<template>
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
      <VChart class="h-[460px] w-full" :option="chartOption" autoresize />
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
</template>
