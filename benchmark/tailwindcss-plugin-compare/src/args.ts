import path from 'node:path'
import type { BenchmarkOptions } from './types'

export const defaultDataPath = path.resolve(import.meta.dirname, '../data/latest.json')
export const defaultReportPath = path.resolve(import.meta.dirname, '../report.md')

function readNumber(value: string | undefined, fallback: number, name: string) {
  if (value === undefined) {
    return fallback
  }
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer, got ${value}`)
  }
  return parsed
}

export function parseBenchmarkArgs(argv: string[]): BenchmarkOptions {
  const options: BenchmarkOptions = {
    runs: 5,
    warmups: 1,
    classCount: 600,
    sourceFiles: 12,
    largeClassCount: 5000,
    largeSourceFiles: 48,
    includeLarge: true,
    includeHmr: true,
    out: defaultDataPath,
    report: defaultReportPath,
    keepTemp: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--') {
      continue
    }
    if (arg === '--runs') {
      options.runs = readNumber(argv[++index], options.runs, '--runs')
    }
    else if (arg === '--warmups') {
      options.warmups = readNumber(argv[++index], options.warmups, '--warmups')
    }
    else if (arg === '--class-count') {
      options.classCount = readNumber(argv[++index], options.classCount, '--class-count')
    }
    else if (arg === '--source-files') {
      options.sourceFiles = readNumber(argv[++index], options.sourceFiles, '--source-files')
    }
    else if (arg === '--large-class-count') {
      options.largeClassCount = readNumber(argv[++index], options.largeClassCount, '--large-class-count')
    }
    else if (arg === '--large-source-files') {
      options.largeSourceFiles = readNumber(argv[++index], options.largeSourceFiles, '--large-source-files')
    }
    else if (arg === '--skip-large') {
      options.includeLarge = false
    }
    else if (arg === '--skip-hmr') {
      options.includeHmr = false
    }
    else if (arg === '--out') {
      options.out = path.resolve(argv[++index] ?? defaultDataPath)
    }
    else if (arg === '--report') {
      options.report = path.resolve(argv[++index] ?? defaultReportPath)
    }
    else if (arg === '--keep-temp') {
      options.keepTemp = true
    }
    else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (options.runs === 0) {
    throw new Error('--runs must be greater than 0')
  }
  return options
}

export function parseReportArgs(argv: string[]) {
  const options = {
    input: defaultDataPath,
    report: defaultReportPath,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--') {
      continue
    }
    if (arg === '--out' || arg === '--input') {
      options.input = path.resolve(argv[++index] ?? defaultDataPath)
    }
    else if (arg === '--report') {
      options.report = path.resolve(argv[++index] ?? defaultReportPath)
    }
    else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}
