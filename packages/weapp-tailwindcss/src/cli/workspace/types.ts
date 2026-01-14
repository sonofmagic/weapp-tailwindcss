export interface WorkspacePatchOptions {
  cwd: string | undefined
  clearCache?: boolean
  recordTarget?: boolean
}

export interface WorkspacePatchResult {
  dir: string
  name?: string
  status: 'patched' | 'skipped' | 'failed'
  message?: string
}
