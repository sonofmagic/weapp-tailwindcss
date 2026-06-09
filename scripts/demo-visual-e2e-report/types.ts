import type { WatchCase } from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types.ts'

export type VisualPlatform = 'h5' | 'weapp' | 'app-android' | 'app-ios' | 'app-harmony'

export interface CaseResult {
  name: string
  platform: VisualPlatform
  status: 'passed' | 'failed' | 'skipped'
  screenshot?: string
  hmrBeforeScreenshot?: string
  hmrAfterScreenshot?: string
  hmrDiff?: string
  diff?: string
  comparison?: Record<string, unknown>
  diagnostics?: Record<string, unknown>
  error?: string
}

export interface RuntimeContext {
  artifactRoot: string
  repoRoot: string
  timeoutMs: number
  viewport: {
    width: number
    height: number
  }
}

export interface MiniProgramHmrMutation {
  marker: string
  restore: () => Promise<void>
}

export interface MiniProgramHmrVisualConfig {
  label: string
  watchCase: WatchCase
  mutate: () => Promise<MiniProgramHmrMutation>
}
