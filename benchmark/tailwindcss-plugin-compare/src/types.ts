export type BenchmarkMode = 'generator' | 'vite-build'

export interface BenchmarkOptions {
  runs: number
  warmups: number
  classCount: number
  sourceFiles: number
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

export interface BenchmarkCaseResult {
  id: string
  name: string
  mode: BenchmarkMode
  plugin: string
  details?: Record<string, unknown>
  warmupMs: number[]
  runsMs: number[]
  stats: BenchmarkStats
  outputCssBytes: number
  classSetSize?: number
  selectorCount?: number
  error?: string
}

export interface BenchmarkFixtureInfo {
  root: string
  cssEntry: string
  htmlEntry: string
  mainEntry: string
  sourcesDir: string
  candidates: string[]
  appendedCandidates: string[]
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
  fixture: {
    classCount: number
    sourceFiles: number
    candidateCount: number
    appendedCandidateCount: number
  }
  results: BenchmarkCaseResult[]
}
