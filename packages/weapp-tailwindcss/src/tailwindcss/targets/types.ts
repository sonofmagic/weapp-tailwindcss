export interface PatchTargetRecord {
  tailwindPackagePath: string
  packageVersion?: string
  recordedAt: string
  source: 'cli' | 'runtime' | string
  tailwindcssBasedir?: string
  cwd?: string
  patchVersion?: string
  packageJsonPath?: string
  recordKey?: string
}

export interface PatchTargetRecordResult {
  baseDir: string
  path: string
  record: PatchTargetRecord
}

export interface SavePatchTargetRecordOptions {
  cwd?: string
  source?: 'cli' | 'runtime' | string
  recordPath?: string
  recordKey?: string
  packageJsonPath?: string
}

export interface PatchTargetRecorder {
  recordPath: string
  message?: string
  reason?: string
  onPatched: () => Promise<string | undefined>
}

export interface PatchTargetRecorderOptions {
  source?: 'cli' | 'runtime' | string
  cwd?: string
  recordTarget?: boolean
  alwaysRecord?: boolean
}
