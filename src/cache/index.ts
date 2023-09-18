import { LRUCache } from 'lru-cache'
import type { sources } from 'webpack'
import md5 from 'md5'

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
  has: (key: string) => boolean
  computeHash: (message: string | Buffer) => string
  calcHashValueChanged: (key: HashMapKey, hash: string) => this
  process: (key: string, callback: () => void | false, fallback: () => void | { key: string; source: sources.Source }) => void
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
    process(key, callback, fallback) {
      const hit = this.getHashValue(key)
      // 文件没有改变
      if (hit && !hit.changed) {
        // 命中缓存
        const returnFlag = callback()
        if (returnFlag !== false) {
          return
        }
      }
      // 默认处理
      const res = fallback()
      if (res) {
        this.set(res.key, res.source)
      }
    }
  }
}

export { createCache }
