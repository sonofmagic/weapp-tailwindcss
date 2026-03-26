import type { CliOptions, WatchCase } from '../types'
import process from 'node:process'
import { buildAppCases } from './apps'
import { buildDemoCases } from './demo'

export function filterCasesForPlatform(cases: WatchCase[], platform: NodeJS.Platform): WatchCase[] {
  if (platform === 'darwin') {
    return cases.filter(item => item.name !== 'uni-app-webpack-tailwindcss-v4')
  }

  if (platform === 'win32') {
    return cases.filter(item =>
      item.name !== 'vite-native-skyline'
      && item.name !== 'uni-app-webpack-tailwindcss-v4',
    )
  }

  return cases
}

export function buildCases(baseCwd: string): WatchCase[] {
  const cases = [
    ...buildDemoCases(baseCwd),
    ...buildAppCases(baseCwd),
  ]

  return filterCasesForPlatform(cases, process.platform)
}

export function pickCases(allCases: WatchCase[], caseName: CliOptions['caseName']) {
  if (caseName === 'all') {
    return allCases
  }

  if (caseName === 'demo' || caseName === 'apps') {
    return allCases.filter(item => item.group === caseName)
  }

  if (caseName === 'both') {
    return allCases.filter(item => item.name === 'taro' || item.name === 'uni')
  }

  return allCases.filter(item => item.name === caseName)
}
