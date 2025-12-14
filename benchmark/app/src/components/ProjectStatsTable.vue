<script setup lang="ts">
import type { ProjectStat } from '../composables/useBenchmarkData'

defineProps<{
  projectStats: ProjectStat[]
}>()
</script>

<template>
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
              <div class="text-xs text-slate-400">
                {{ stat.meta.typeLabel }} · 样本数: {{ stat.sampleCount }}
              </div>
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
</template>
