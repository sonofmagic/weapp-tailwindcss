import process from 'node:process'
import { normalizeOutputPathKey } from '../../shared/module-graph'

const VITE_LAST_CSS_RESULT_CACHE_MAX = 64

export function resolveViteCssTaskConcurrency(useIncrementalMode: boolean) {
  const configured = Number.parseInt(process.env['WEAPP_TW_VITE_CSS_CONCURRENCY'] ?? '', 10)
  if (Number.isFinite(configured) && configured > 0) {
    return configured
  }
  return useIncrementalMode ? 1 : 2
}

export function normalizeViteCssCacheKey(file: string) {
  return normalizeOutputPathKey(file)
}

export function rememberLastCssResult(
  resultByFile: Map<string, string>,
  sourceHashByFile: Map<string, string>,
  file: string,
  css: string,
  sourceHash: string,
) {
  const key = normalizeViteCssCacheKey(file)
  resultByFile.delete(key)
  sourceHashByFile.delete(key)
  resultByFile.set(key, css)
  sourceHashByFile.set(key, sourceHash)
  while (resultByFile.size > VITE_LAST_CSS_RESULT_CACHE_MAX) {
    const oldestKey = resultByFile.keys().next().value
    if (typeof oldestKey !== 'string') {
      break
    }
    resultByFile.delete(oldestKey)
    sourceHashByFile.delete(oldestKey)
  }
}

export function getLastCssResult(resultByFile: Map<string, string>, ...files: Array<string | undefined>) {
  for (const file of files) {
    if (!file) {
      continue
    }
    const key = normalizeViteCssCacheKey(file)
    const css = resultByFile.get(key)
    if (css == null) {
      continue
    }
    resultByFile.delete(key)
    resultByFile.set(key, css)
    return css
  }
  return undefined
}

export function getLastCssSourceHash(sourceHashByFile: Map<string, string>, file: string) {
  return sourceHashByFile.get(normalizeViteCssCacheKey(file))
}

export function pruneLastCssResults(
  resultByFile: Map<string, string>,
  sourceHashByFile: Map<string, string>,
  activeFiles: Set<string>,
) {
  for (const key of resultByFile.keys()) {
    if (activeFiles.has(key)) {
      continue
    }
    resultByFile.delete(key)
    sourceHashByFile.delete(key)
  }
}
