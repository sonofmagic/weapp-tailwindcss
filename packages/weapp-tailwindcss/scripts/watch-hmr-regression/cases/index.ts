import type { CliOptions, WatchCase } from '../types'
import process from 'node:process'
import { buildAppCases } from './apps'
import { buildDemoCases } from './demo'

export function buildCases(baseCwd: string): WatchCase[] {
  const cases = [
    ...buildDemoCases(baseCwd),
    ...buildAppCases(baseCwd),
  ]

  if (process.platform === 'darwin') {
    return cases.filter(item => item.name !== 'uni-app-webpack-tailwindcss-v4')
  }

  return cases
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
