import type { ParseResult, ParserOptions } from '@babel/parser'
import type { File } from '@babel/types'
import { LRUCache } from 'lru-cache'
import { parse } from '@/babel'

export const parseCache: LRUCache<string, ParseResult<File>> = new LRUCache<string, ParseResult<File>>(
  {
    max: 1024,
  },
)

export function genCacheKey(source: string, options: any): string {
  // 允许调用方传入预先计算好的 cacheKey 字符串，避免重复 JSON.stringify
  if (typeof options === 'string') {
    return source + options
  }
  return source + JSON.stringify(options, (_, val) => (typeof val === 'function' ? val.toString() : val))
}

export function babelParse(
  code: string,
  // 接受可选的 cacheKey，避免每次都对 options 做 JSON.stringify。
  opts: (ParserOptions & { cache?: boolean, cacheKey?: string }) = {},
) {
  const { cache, cacheKey, ...rest } = opts as any
  const cacheKeyString = genCacheKey(code, cacheKey ?? rest)
  let result: ParseResult<File> | undefined
  if (cache) {
    result = parseCache.get(cacheKeyString)
  }

  if (!result) {
    // 传给 @babel/parser 前剔除自定义字段，避免产生意外行为。
    const { cache: _cache, cacheKey: _cacheKey, ...parseOptions } = opts as any
    result = parse(code, parseOptions)
    if (cache) {
      parseCache.set(cacheKeyString, result)
    }
  }

  return result
}
