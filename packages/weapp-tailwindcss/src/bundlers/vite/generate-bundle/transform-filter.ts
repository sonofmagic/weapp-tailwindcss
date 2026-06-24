import type { OutputAsset, OutputChunk } from 'rollup'
import type { InternalUserDefinedOptions } from '@/types'
import type { TransformRule } from '@/types/user-defined-options/matcher'
import path from 'node:path'
import micromatch from 'micromatch'
import { cleanUrl, slash } from '../utils'

type TransformMatcher = (id: string) => boolean

interface TransformFilter {
  include?: TransformMatcher | undefined
  exclude?: TransformMatcher | undefined
}

function toArray<T>(value: T | T[] | undefined) {
  return Array.isArray(value) ? value : value === undefined ? [] : [value]
}

function normalizeSourceId(id: string) {
  const file = cleanUrl(id)
  return path.isAbsolute(file) ? path.resolve(file) : undefined
}

function collectChunkModuleIds(chunk: OutputChunk) {
  const ids = new Set<string>()
  for (const id of chunk.moduleIds ?? []) {
    const normalized = normalizeSourceId(id)
    if (normalized) {
      ids.add(normalized)
    }
  }
  for (const id of Object.keys(chunk.modules ?? {})) {
    const normalized = normalizeSourceId(id)
    if (normalized) {
      ids.add(normalized)
    }
  }
  return ids
}

function collectAssetSourceIds(asset: OutputAsset, fallbackFile: string, rootDir: string) {
  const ids = new Set<string>()
  const sourceCandidates = [
    asset.originalFileName,
    ...(asset.originalFileNames ?? []),
  ].filter(candidate => typeof candidate === 'string' && candidate.length > 0)
  const candidates = sourceCandidates.length > 0 ? sourceCandidates : [fallbackFile]
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || candidate.length === 0) {
      continue
    }
    const cleanCandidate = cleanUrl(candidate)
    const resolved = path.isAbsolute(cleanCandidate)
      ? path.resolve(cleanCandidate)
      : path.resolve(rootDir, cleanCandidate)
    ids.add(resolved)
  }
  return ids
}

function isStringRuleMatched(rule: string, id: string, rootDir: string) {
  const normalizedId = slash(id)
  const normalizedRule = slash(rule)
  if (path.isAbsolute(rule)) {
    return micromatch.isMatch(normalizedId, normalizedRule)
  }

  const relative = slash(path.relative(rootDir, id))
  return relative.length > 0 && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, normalizedRule)
}

function isRuleMatched(rule: TransformRule, id: string, rootDir: string) {
  if (typeof rule === 'string') {
    return isStringRuleMatched(rule, id, rootDir)
  }
  if (rule instanceof RegExp) {
    rule.lastIndex = 0
    return rule.test(slash(id))
  }
  return rule(id) === true
}

function createTransformMatcher(
  rules: TransformRule | TransformRule[] | undefined,
  rootDir: string,
) {
  const normalizedRules = toArray(rules)
  if (normalizedRules.length === 0) {
    return undefined
  }

  return (id: string) => normalizedRules.some(rule => isRuleMatched(rule, id, rootDir))
}

function shouldSkipSourceIds(sourceIds: Set<string>, filter: TransformFilter) {
  if (sourceIds.size === 0) {
    return false
  }

  if (filter.exclude) {
    let excluded = true
    for (const id of sourceIds) {
      if (!filter.exclude(id)) {
        excluded = false
        break
      }
    }
    if (excluded) {
      return true
    }
  }

  if (filter.include) {
    for (const id of sourceIds) {
      if (filter.include(id)) {
        return false
      }
    }
    return true
  }

  return false
}

export function createTransformFilter(
  options: InternalUserDefinedOptions['transform'],
  rootDir: string,
) {
  const include = createTransformMatcher(options?.include, rootDir)
  const exclude = createTransformMatcher(options?.exclude, rootDir)
  if (!include && !exclude) {
    return undefined
  }

  return { include, exclude } satisfies TransformFilter
}

export function shouldSkipViteJsChunkTransform(
  chunk: OutputChunk,
  filter: TransformFilter | undefined,
) {
  if (!filter) {
    return false
  }
  const moduleIds = collectChunkModuleIds(chunk)
  return shouldSkipSourceIds(moduleIds, filter)
}

export function shouldSkipViteAssetTransform(
  asset: OutputAsset,
  file: string,
  rootDir: string,
  filter: TransformFilter | undefined,
) {
  if (!filter) {
    return false
  }

  const sourceIds = collectAssetSourceIds(asset, file, rootDir)
  return shouldSkipSourceIds(sourceIds, filter)
}

function createRuleSignature(rules: TransformRule | TransformRule[] | undefined) {
  return toArray(rules)
    .map((rule) => {
      if (typeof rule === 'string') {
        return `s:${rule}`
      }
      if (rule instanceof RegExp) {
        return `r:${rule.source}/${rule.flags}`
      }
      return 'f'
    })
    .join('|') || 'none'
}

export function createTransformFilterSignature(options: InternalUserDefinedOptions['transform']) {
  return [
    `include:${createRuleSignature(options?.include)}`,
    `exclude:${createRuleSignature(options?.exclude)}`,
  ].join(';')
}
