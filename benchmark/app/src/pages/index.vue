<script setup lang="ts">
import MonthDeltaSection from '../components/MonthDeltaSection.vue'
import ProjectStatsTable from '../components/ProjectStatsTable.vue'
import SummaryHeader from '../components/SummaryHeader.vue'
import TrendChartCard from '../components/TrendChartCard.vue'
import { useBenchmarkData, type RegistryPayload } from '../composables/useBenchmarkData'
import projectRegistryJson from '../projects.generated.json'

const {
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
} = useBenchmarkData(projectRegistryJson as RegistryPayload)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SummaryHeader
        :earliest-date="earliestDate"
        :latest-date="latestDate"
        :sample-count="sampleCount"
        :registration-summary="registrationSummary"
        :unregistered-count="unregisteredCount"
      />

      <TrendChartCard
        :loading="loading"
        :load-error="loadError"
        :has-data="hasData"
        :chart-option="chartOption"
      />

      <MonthDeltaSection
        v-if="!loadError"
        :month-window-days="monthWindowDays"
        :range-labels="rangeLabels"
        :month-delta-leaders="monthDeltaLeaders"
        :month-change-stats="monthChangeStats"
        :chart-option="monthDeltaChartOption"
      />

      <ProjectStatsTable v-if="!loadError" :project-stats="projectStats" />
    </div>
  </div>
</template>
