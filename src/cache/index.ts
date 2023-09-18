import path from 'node:path'
import { LRUCache } from 'lru-cache'
import type { sources } from 'webpack'

export interface HashMapValue {
  hash: string
  changed: boolean
}

export type HashMapKey = string | number

export interface ICreateCacheReturnType {
  // id:hash
  hashMap: Map<HashMapKey, HashMapValue>
  instance: LRUCache<string, sources.Source>
  hasHashKey: (key: HashMapKey) => boolean
  getHashValue: (key: HashMapKey) => HashMapValue | undefined
  setHashValue: (key: HashMapKey, value: HashMapValue) => this['hashMap']
  removeExt: (file: string) => string
  get: (key: string) => sources.Source | undefined
  set: (key: string, value: sources.Source) => this['instance']
}

function createCache(): ICreateCacheReturnType {
  const hashMap = new Map<HashMapKey, HashMapValue>()
  const instance = new LRUCache<string, sources.Source>({
    // 可能会添加和删除一些页面和组件, 先设定 1024 吧
    max: 1024,
    ttl: 0,
    ttlAutopurge: false
  })
  return {
    hashMap,
    instance,
    hasHashKey(key) {
      return hashMap.has(key)
    },
    getHashValue(key) {
      return hashMap.get(key)
    },
    setHashValue(key, value) {
      return hashMap.set(key, value)
    },
    removeExt(file) {
      return file.replace(/\.[^./]+$/, '')
    },
    get(key) {
      return instance.get(key)
    },
    set(key, value) {
      return instance.set(key, value)
    }
  }
}

export { createCache }
