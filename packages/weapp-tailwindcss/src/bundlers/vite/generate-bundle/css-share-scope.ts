import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import { normalizeOutputPathKey } from '../../shared/module-graph'

const CSS_URL_FUNCTION_RE = /url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/gi
const CSS_PATH_INDEPENDENT_URL_RE = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i
const CSS_IMPORT_RE = /@import\b/i

function isPathIndependentCssUrl(value: string) {
  const normalized = value.trim()
  return normalized.length > 0 && CSS_PATH_INDEPENDENT_URL_RE.test(normalized)
}

function hasPathDependentCssUrl(rawSource: string) {
  CSS_URL_FUNCTION_RE.lastIndex = 0
  let match = CSS_URL_FUNCTION_RE.exec(rawSource)
  while (match !== null) {
    const value = match[1] ?? match[2] ?? match[3] ?? ''
    if (!isPathIndependentCssUrl(value)) {
      return true
    }
    match = CSS_URL_FUNCTION_RE.exec(rawSource)
  }
  return false
}

function createCssTransformShareScope(file: string, rawSource: string) {
  if (CSS_IMPORT_RE.test(rawSource) || hasPathDependentCssUrl(rawSource)) {
    return `dir:${normalizeOutputPathKey(path.dirname(file))}`
  }
  return 'global'
}

export function createCssTransformShareScopeKey(
  opts: InternalUserDefinedOptions,
  file: string,
  rawSource: string,
) {
  if (opts.mainCssChunkMatcher(file, opts.appType)) {
    return `main:${normalizeOutputPathKey(file)}`
  }
  return createCssTransformShareScope(file, rawSource)
}

export function createCssRuntimeSignature(runtimeSignature: string, generatorCandidateSignature: string) {
  return `${runtimeSignature}:${generatorCandidateSignature}`
}
