export interface SerializablePluginCache {
  [key: string]: [number, any]
}

export interface PluginCache {
  delete: (id: string) => boolean
  get: <T = any>(id: string) => T
  has: (id: string) => boolean
  set: <T = any>(id: string, value: T) => void
}

export function createPluginCache(cache: SerializablePluginCache): PluginCache {
  return {
    delete(id: string) {
      return delete cache[id]
    },
    get(id: string) {
      const item = cache[id]
      if (!item) {
        return
      }
      item[0] = 0
      return item[1]
    },
    has(id: string) {
      const item = cache[id]
      if (!item) {
        return false
      }
      item[0] = 0
      return true
    },
    set(id: string, value: any) {
      cache[id] = [0, value]
    },
  }
}
