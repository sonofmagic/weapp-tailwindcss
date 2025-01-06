import type { AnyConfig } from './types'
import { createClassGroupUtils } from './class-group-utils'
import { createLruCache } from './lru-cache'
import { createParseClassName } from './parse-class-name'

export type ConfigUtils = ReturnType<typeof createConfigUtils>

export function createConfigUtils(config: AnyConfig) {
  return {
    cache: createLruCache<string, string>(config.cacheSize),
    parseClassName: createParseClassName(config),
    ...createClassGroupUtils(config),
  }
}
