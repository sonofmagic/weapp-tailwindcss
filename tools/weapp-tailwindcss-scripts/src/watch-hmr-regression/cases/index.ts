import type { CliOptions, ConcreteWatchCaseName, DemoWatchShardName, WatchCase } from '../types'
import process from 'node:process'
import { buildDemoCases } from './demo'

export const demoWatchShardCases: Record<DemoWatchShardName, ConcreteWatchCaseName[]> = {
  'demo-core': [
    'gulp-tailwindcss-v3',
    'gulp-tailwindcss-v4',
    'mpx-tailwindcss-v3',
    'weapp-vite-tailwindcss-v3',
    'weapp-vite-tailwindcss-v4',
    'mpx-tailwindcss-v4',
  ],
  'demo-taro-react': [
    'taro-webpack-react-tailwindcss-v3',
    'taro-vite-react-tailwindcss-v4',
    'taro-vite-react-tailwindcss-v3',
    'taro-webpack-react-tailwindcss-v4',
  ],
  'demo-taro-vue3': [
    'taro-webpack-vue3-tailwindcss-v3',
    'taro-vite-vue3-tailwindcss-v3',
    'taro-vite-vue3-tailwindcss-v4',
    'taro-webpack-vue3-tailwindcss-v4',
  ],
  'demo-uni': [
    'uni-app-vite-tailwindcss-v3',
    'uni-app-vite-tailwindcss-v4',
  ],
}

const demoWatchShardNames = new Set<DemoWatchShardName>(Object.keys(demoWatchShardCases) as DemoWatchShardName[])
const localOnlyWatchCaseNames = new Set<ConcreteWatchCaseName>([
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'uni-app-x-hbuilderx-tailwindcss-v3',
  'uni-app-x-hbuilderx-tailwindcss-v4',
])

export function isDemoWatchShardName(caseName: CliOptions['caseName']): caseName is DemoWatchShardName {
  return demoWatchShardNames.has(caseName as DemoWatchShardName)
}

export function filterCasesForPlatform(cases: WatchCase[], _platform: NodeJS.Platform): WatchCase[] {
  return cases
}

export function isLocalOnlyWatchCase(caseName: CliOptions['caseName']) {
  return caseName !== 'all' && caseName !== 'both' && caseName !== 'demo' && !isDemoWatchShardName(caseName) && localOnlyWatchCaseNames.has(caseName)
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

  if (isDemoWatchShardName(caseName)) {
    const shardCases = new Set(demoWatchShardCases[caseName])
    return allCases.filter(item => shardCases.has(item.name))
  }

  if (caseName === 'both') {
    return allCases.filter(item => item.name === 'taro-webpack-react-tailwindcss-v3' || item.name === 'uni-app-vite-tailwindcss-v3')
  }

  return allCases.filter(item => item.name === caseName)
}
