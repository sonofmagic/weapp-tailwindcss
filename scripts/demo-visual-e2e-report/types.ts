export interface CaseResult {
  name: string
  platform: 'h5' | 'weapp'
  status: 'passed' | 'failed' | 'skipped'
  screenshot?: string
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
