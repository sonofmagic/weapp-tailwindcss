import type { WatchCase } from '../../types'
import { buildDemoBaseCases } from './base'
import { buildDemoExtendedCases } from './extended'

export function buildDemoCases(baseCwd: string): WatchCase[] {
  return [
    ...buildDemoBaseCases(baseCwd),
    ...buildDemoExtendedCases(baseCwd),
  ]
}
