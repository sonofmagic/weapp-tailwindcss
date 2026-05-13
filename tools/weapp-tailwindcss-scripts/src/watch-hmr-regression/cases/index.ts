import type { CliOptions, WatchCase } from '../types'
import process from 'node:process'
import { buildDemoCases } from './demo'

export function filterCasesForPlatform(cases: WatchCase[], _platform: NodeJS.Platform): WatchCase[] {
  return cases
}

export function buildCases(baseCwd: string): WatchCase[] {
  const cases = [
    ...buildDemoCases(baseCwd),
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
