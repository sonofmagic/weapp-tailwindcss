<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { VChart } from '../plugins/echarts'

defineProps<{
  loading: boolean
  loadError: string | null
  hasData: boolean
  chartOption: EChartsOption
}>()
</script>

<template>
  <section
    v-if="loading"
    class="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 text-center text-slate-300"
  >
    正在加载构建数据…
  </section>
  <section
    v-else-if="loadError"
    class="rounded-xl border border-rose-900/60 bg-rose-900/20 p-6 text-center text-sm text-rose-100"
  >
    数据加载失败：{{ loadError }}。请确认已生成 /public/data/index.json（运行 pnpm run build:data）。
  </section>
  <section
    v-else-if="hasData"
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
</template>
