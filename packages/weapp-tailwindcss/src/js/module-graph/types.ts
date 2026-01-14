import type { IJsHandlerOptions } from '../../types'
import type { SourceAnalysis } from '../babel'

export interface ModuleState {
  filename: string
  source: string
  analysis: SourceAnalysis
}

export interface QueueItem {
  filename: string
  depth: number
}

export interface ModuleGraphEntry {
  filename: string
  source: string
  analysis: SourceAnalysis
  handlerOptions: IJsHandlerOptions
}
