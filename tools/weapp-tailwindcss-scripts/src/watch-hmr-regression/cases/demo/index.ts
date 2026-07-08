import type { WatchCase } from '../../types'
import { buildDemoBaseCases } from './base'
import { buildDemoExtendedCases } from './extended'
import { buildUniAppHBuilderXCases } from './hbuilderx'

function withIconifyHmr(cases: WatchCase[]): WatchCase[] {
  return cases.map(watchCase => ({
    ...watchCase,
    iconifyHmr: watchCase.iconifyHmr ?? {
      sourceFile: watchCase.templateMutation.sourceFile,
    },
    webHmr: watchCase.webHmr
      ? {
          ...watchCase.webHmr,
          iconifyHmr: watchCase.webHmr.iconifyHmr ?? {},
        }
      : watchCase.webHmr,
  }))
}

export function buildDemoCases(baseCwd: string, options: {
  includeLocalOnly?: boolean
} = {}): WatchCase[] {
  return withIconifyHmr([
    ...buildDemoBaseCases(baseCwd),
    ...buildDemoExtendedCases(baseCwd),
    ...(options.includeLocalOnly ? buildUniAppHBuilderXCases(baseCwd) : []),
  ])
}

export { buildUniAppHBuilderXCases }
