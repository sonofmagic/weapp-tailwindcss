import type { CliOptions, ConcreteWatchCaseName, WatchCase } from '../types'
import process from 'node:process'
import { buildDemoCases } from './demo'

const localOnlyWatchCaseNames = new Set<ConcreteWatchCaseName>([
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
])

export function filterCasesForPlatform(cases: WatchCase[], _platform: NodeJS.Platform): WatchCase[] {
  return cases
}

export function isLocalOnlyWatchCase(caseName: CliOptions['caseName']) {
  return caseName !== 'all' && caseName !== 'both' && caseName !== 'demo' && localOnlyWatchCaseNames.has(caseName)
}

export function buildCases(baseCwd: string, options: {
  includeLocalOnly?: boolean
} = {}): WatchCase[] {
  const cases = [
    ...buildDemoCases(baseCwd, options),
  ]

  return filterCasesForPlatform(cases, process.platform)
}

export function pickCases(allCases: WatchCase[], caseName: CliOptions['caseName']) {
  if (caseName === 'all') {
    return allCases
  }

  if (caseName === 'demo') {
    return allCases.filter(item => item.group === caseName)
  }

  if (caseName === 'both') {
    return allCases.filter(item => item.name === 'taro-webpack-react-tailwindcss-v3' || item.name === 'uni-app-vite-tailwindcss-v3')
  }

  return allCases.filter(item => item.name === caseName)
}
