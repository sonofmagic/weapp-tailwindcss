import type { CliOptions, WatchCase } from '../types'
import { buildAppCases } from './apps'
import { buildDemoCases } from './demo'

export function buildCases(baseCwd: string): WatchCase[] {
  return [
    ...buildDemoCases(baseCwd),
    ...buildAppCases(baseCwd),
  ]
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
