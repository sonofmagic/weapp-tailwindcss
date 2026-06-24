import { existsSync } from 'node:fs'
import path from 'node:path'
import { normalizeOutputPathKey } from '../shared/module-graph'

export function isMissingInternalCssSource(file: string, packageDir: string) {
  return !existsSync(file) && path.resolve(file).startsWith(`${packageDir}${path.sep}`)
}

export function normalizeVitePersistentCacheKey(file: string) {
  return normalizeOutputPathKey(file)
}

export function toMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024)
}

export function summarizeStringCache(map: Map<string, string>) {
  let bytes = 0
  for (const value of map.values()) {
    bytes += value.length
  }
  return {
    bytes,
    mb: toMb(bytes),
    size: map.size,
  }
}

export function summarizeViteProcessedCssResults(map: Map<string, { css: string }>) {
  let bytes = 0
  for (const record of map.values()) {
    bytes += record.css.length
  }
  return {
    bytes,
    mb: toMb(bytes),
    size: map.size,
  }
}
