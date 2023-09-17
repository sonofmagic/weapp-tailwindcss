import { LRUCache } from 'lru-cache'
import type { sources } from 'webpack'
export interface ICreateCacheReturnType {
  // id:hash
  hashMap: Map<
    string | number,
    {
      hash: string
      changed: boolean
    }
  >
  instance: LRUCache<string, sources.Source>
}

function createCache(): ICreateCacheReturnType {
  const hashMap = new Map<
    string | number,
    {
      hash: string
      changed: boolean
    }
  >()
  const instance = new LRUCache<string, sources.Source>({
    // 可能会添加和删除一些页面和组件, 先设定 1024 吧
    max: 1024,
    ttl: 0,
    ttlAutopurge: false
  })
  return {
    hashMap,
    instance
  }
}

export { createCache }
