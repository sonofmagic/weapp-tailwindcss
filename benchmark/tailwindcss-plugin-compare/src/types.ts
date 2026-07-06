export type BenchmarkMode = 'generator' | 'vite-build' | 'vite-hmr'

export interface BenchmarkOptions {
  runs: number
  warmups: number
  classCount: number
  sourceFiles: number
  largeClassCount: number
  largeSourceFiles: number
  includeLarge: boolean
  includeHmr: boolean
  out: string
  report: string
  keepTemp: boolean
}

export interface BenchmarkStats {
  mean: number
  median: number
  min: number
  max: number
  p75: number
  p95: number
}

export interface BenchmarkMemoryStats {
  rssBeforeBytes: number
  rssAfterBytes: number
  rssPeakBytes: number
  rssDeltaBytes: number
  heapBeforeBytes: number
  heapAfterBytes: number
  heapPeakBytes: number
  heapDeltaBytes: number
}

export interface BenchmarkCaseResult {
  id: string
  name: string
  mode: BenchmarkMode
  plugin: string
  scenarioId: string
  scenarioName: string
  details?: Record<string, unknown>
  warmupMs: number[]
  runsMs: number[]
  stats: BenchmarkStats
  outputCssBytes: number
  memory?: BenchmarkMemoryStats
  classSetSize?: number
  selectorCount?: number
  error?: string
}

export interface CaseRunResult {
  css: string
  classSetSize?: number
  selectorCount?: number
  details?: Record<string, unknown>
}

export interface BenchmarkCase {
  id: string
  name: string
  mode: BenchmarkMode
  plugin: string
  scenarioId: string
  scenarioName: string
  run: () => Promise<CaseRunResult>
  dispose?: () => Promise<void>
}

export interface BenchmarkFixtureInfo {
  root: string
  cssEntry: string
  htmlEntry: string
  mainEntry: string
  sourcesDir: string
  hmrSourceFile: string
  candidates: string[]
  appendedCandidates: string[]
  hmrCandidates: string[]
}

export interface BenchmarkScenarioSummary {
  id: string
  name: string
  classCount: number
  sourceFiles: number
  candidateCount: number
  appendedCandidateCount: number
  hmrCandidateCount: number
}

export interface BenchmarkReport {
  schemaVersion: 1
  generatedAt: string
  environment: {
    node: string
    pnpm: string | null
    platform: NodeJS.Platform
    arch: string
    osRelease: string
    cpus: string[]
    packageVersions: Record<string, string | null>
  }
  parameters: Omit<BenchmarkOptions, 'out' | 'report' | 'keepTemp'>
  scenarios: BenchmarkScenarioSummary[]
  results: BenchmarkCaseResult[]
}
