import type { TailwindSourceEntry } from './types'

export interface SourceScanPlanOptions {
  base: string
  mode: 'auto' | 'explicit' | 'disabled'
  entries?: TailwindSourceEntry[]
  pattern?: string
}

/** 禁用自动扫描不抹掉显式来源；显式空来源不会退回扫描整个项目。 */
export function createSourceScanPlan(options: SourceScanPlanOptions): TailwindSourceEntry[] {
  return [
    ...(options.mode === 'auto' ? [{ base: options.base, pattern: options.pattern ?? '**/*', negated: false }] : []),
    ...(options.entries ?? []),
  ]
}
