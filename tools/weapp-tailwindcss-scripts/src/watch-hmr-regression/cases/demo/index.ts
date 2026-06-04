import type { WatchCase } from '../../types'
import { buildDemoBaseCases } from './base'
import { buildDemoExtendedCases } from './extended'
import { buildUniAppHBuilderXCases } from './hbuilderx'

export function buildDemoCases(baseCwd: string, options: {
  includeLocalOnly?: boolean
} = {}): WatchCase[] {
  return [
    ...buildDemoBaseCases(baseCwd),
    ...buildDemoExtendedCases(baseCwd),
    ...(options.includeLocalOnly ? buildUniAppHBuilderXCases(baseCwd) : []),
  ]
}

export { buildUniAppHBuilderXCases }
