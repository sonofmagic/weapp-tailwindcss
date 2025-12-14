<script setup lang="ts">
interface RegistrationSummary {
  total: number
  apps: number
  demos: number
}

defineProps<{
  earliestDate: string
  latestDate: string
  sampleCount: number
  registrationSummary: RegistrationSummary
  unregisteredCount: number
}>()
</script>

<template>
  <section class="space-y-2">
    <h1 class="text-2xl font-semibold">构建速度趋势</h1>
    <p class="text-sm text-slate-400">
      数据范围: {{ earliestDate || '无数据' }} - {{ latestDate || '无数据' }}，共 {{ sampleCount }} 次采样。
    </p>
    <p class="text-sm text-slate-400">
      已登记 {{ registrationSummary.total }} 个项目（应用 {{ registrationSummary.apps }}，示例
      {{ registrationSummary.demos }}），未登记但存在历史数据 {{ unregisteredCount }} 个。
    </p>
  </section>
</template>
