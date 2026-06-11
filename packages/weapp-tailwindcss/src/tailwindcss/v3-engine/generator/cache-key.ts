import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV3GenerateOptions, TailwindV3GenerateTarget, TailwindV3ResolvedSource } from '../types'
import fs from 'node:fs'
import { normalizeConfigObject } from './content'

function createStableJson(value: unknown): string {
  if (value === undefined) {
    return 'undefined'
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(item => createStableJson(item)).join(',')}]`
  }
  return `{${Object.keys(value).sort().map((key) => {
    const record = value as Record<string, unknown>
    return `${JSON.stringify(key)}:${createStableJson(record[key])}`
  }).join(',')}}`
}

function createDependencyFingerprint(files: string[]) {
  return files.map((file) => {
    try {
      const stat = fs.statSync(file)
      return `${file}:${stat.size}:${stat.mtimeMs}`
    }
    catch {
      return `${file}:missing`
    }
  }).join('|')
}

export function createIncrementalGenerateCacheKey(
  source: TailwindV3ResolvedSource,
  target: TailwindV3GenerateTarget,
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
  bareArbitraryValues: TailwindV3GenerateOptions['bareArbitraryValues'],
) {
  return [
    source.packageName,
    source.postcssPlugin,
    source.cwd,
    source.config ?? 'config:missing',
    createDependencyFingerprint(source.dependencies),
    source.css,
    createStableJson(normalizeConfigObject(source.configObject)?.content),
    target,
    createStableJson(styleOptions),
    createStableJson(bareArbitraryValues),
  ].join('\0')
}
