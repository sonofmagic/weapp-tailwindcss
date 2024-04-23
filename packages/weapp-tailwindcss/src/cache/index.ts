import { LRUCache } from 'lru-cache'
import type { sources } from 'webpack'
import md5 from 'md5'

export interface HashMapValue {
  hash: string
  changed: boolean
}

export type HashMapKey = string | number

export type CacheValue = sources.Source | string

export interface ICreateCacheReturnType {
  // id:hash instance
  hashMap: Map<HashMapKey, HashMapValue>
  instance: LRUCache<string, CacheValue>
  // map
  hasHashKey: (key: HashMapKey) => boolean
  getHashValue: (key: HashMapKey) => HashMapValue | undefined
  setHashValue: (key: HashMapKey, value: HashMapValue) => this['hashMap']
  // util
  // removeExt: (file: string) => string
  computeHash: (message: string | Buffer) => string
  // cache
  get: <V extends CacheValue = sources.Source>(key: string) => V | undefined
  set: <V extends CacheValue = sources.Source>(key: string, value: V) => this['instance']
  has: (key: string) => boolean
  // flow
  calcHashValueChanged: (key: HashMapKey, hash: string) => this
  process: (
    key: string,
    callback: () => void | false | Promise<void | false>,
    fallback: () => void | { key: string; source: CacheValue } | Promise<void | { key: string; source: CacheValue }>
  ) => void | Promise<void>
}

export type ICreateCacheOptions = boolean

function createCache(options?: ICreateCacheOptions): ICreateCacheReturnType {
  const disabled = options === false
  const hashMap = new Map<HashMapKey, HashMapValue>()
  const instance = new LRUCache<string, CacheValue>({
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
    get<T>(key: string) {
      return instance.get(key) as T
    },
    set(key, value) {
      return instance.set(key, value)
    },
    computeHash(message) {
      return md5(message)
    },
    calcHashValueChanged(key, hash) {
      const hit = this.getHashValue(key)
      if (hit) {
        // 文件内容没有改变
        // 改变了，就给新的哈希值
        this.setHashValue(key, {
          // new file should be changed
          changed: hash !== hit.hash,
          // new hash
          hash
        })
      } else {
        // add to hashmap
        this.setHashValue(key, {
          // new file should be changed
          changed: true,
          hash
        })
      }
      return this
    },
    has(key) {
      return instance.has(key)
    },
    async process(key, callback, fallback) {
      if (disabled) {
        // 默认处理
        const res = await fallback()
        if (res) {
          this.set(res.key, res.source)
        }
      } else {
        const hit = this.getHashValue(key)
        // 文件没有改变
        if (hit && !hit.changed) {
          // 命中缓存
          const returnFlag = await callback()
          if (returnFlag !== false) {
            return
          }
        }
        // 默认处理
        const res = await fallback()
        if (res) {
          this.set(res.key, res.source)
        }
      }
    }
  }
}

export { createCache }
