import type { ParseResult, ParserOptions } from '@babel/parser'
import type { File } from '@babel/types'
import { LRUCache } from 'lru-cache'
import { parse } from '@/babel'
import { md5Hash } from '@/cache/md5'
import { DEFAULT_PARSE_CACHE_MAX_ENTRIES, DEFAULT_PARSE_CACHE_MAX_SOURCE_LENGTH, HARD_PARSE_CACHE_MAX_ENTRIES } from './cache-options'

export type BabelParseOptions = ParserOptions & {
  cache?: boolean | undefined
  cacheKey?: string | undefined
  cacheMaxEntries?: number | undefined
  cacheMaxSourceLength?: number | undefined
}

export const parseCache: LRUCache<string, ParseResult<File>> = new LRUCache<string, ParseResult<File>>(
  {
    max: HARD_PARSE_CACHE_MAX_ENTRIES,
  },
)

export function genCacheKey(source: string, options: any): string {
  // 允许调用方传入预先计算好的 cacheKey 字符串，避免重复 JSON.stringify
  if (typeof options === 'string') {
    return `${md5Hash(source)}:${options}`
  }
  return `${md5Hash(source)}:${JSON.stringify(options, (_, val) => (typeof val === 'function' ? val.toString() : val))}`
}

function normalizeCacheMaxEntries(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_PARSE_CACHE_MAX_ENTRIES
  }
  return Math.min(Math.max(Math.floor(value), 0), HARD_PARSE_CACHE_MAX_ENTRIES)
}

function normalizeCacheMaxSourceLength(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_PARSE_CACHE_MAX_SOURCE_LENGTH
  }
  return Math.max(Math.floor(value), 0)
}

function trimParseCache(maxEntries: number) {
  while (parseCache.size > maxEntries) {
    parseCache.pop()
  }
}

export function babelParse(
  code: string,
  // 接受可选的 cacheKey，避免每次都对 options 做 JSON.stringify。
  opts: BabelParseOptions = {},
) {
  const { cache, cacheKey, cacheMaxEntries, cacheMaxSourceLength, ...rest } = opts as any
  const maxEntries = normalizeCacheMaxEntries(cacheMaxEntries)
  const maxSourceLength = normalizeCacheMaxSourceLength(cacheMaxSourceLength)
  const shouldCache = cache === true && maxEntries > 0 && code.length <= maxSourceLength
  const cacheKeyString = shouldCache ? genCacheKey(code, cacheKey ?? rest) : undefined
  let result: ParseResult<File> | undefined
  if (shouldCache) {
    trimParseCache(maxEntries)
    result = parseCache.get(cacheKeyString!)
  }

  if (!result) {
    // 传给 @babel/parser 前剔除自定义字段，避免产生意外行为。
    const {
      cache: _cache,
      cacheKey: _cacheKey,
      cacheMaxEntries: _cacheMaxEntries,
      cacheMaxSourceLength: _cacheMaxSourceLength,
      ...parseOptions
    } = opts as any
    result = parse(code, parseOptions)
    if (shouldCache) {
      parseCache.set(cacheKeyString!, result)
      trimParseCache(maxEntries)
    }
  }

  return result
}
