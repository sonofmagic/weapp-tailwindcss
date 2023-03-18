import path from 'path'
import fs from 'fs'
import type { Rule } from 'postcss'

export function getContexts() {
  // const cwd = process.cwd()
  //
  const distPath = path.dirname(require.resolve('tailwindcss/lib')) //  path.join(cwd, 'node_modules', 'tailwindcss/lib')
  // index.js
  // plugin.js
  let injectFilePath = path.join(distPath, 'plugin.js')
  if (!fs.existsSync(injectFilePath)) {
    injectFilePath = path.join(distPath, 'index.js')
  }

  const mo = require(injectFilePath)
  if (mo.contextRef) {
    return mo.contextRef.value as any[]
  }
  return []
}

export function getClassCaches(): Map<
  string,
  (
    | {
        layer: string
        options: Record<string, any>
        sort: Record<string, any>
      }
    | Rule
  )[]
>[] {
  const contexts = getContexts()
  return (contexts as any[]).map((x) => x.classCache)
}

export function getClassCacheSet(): Set<string> {
  const classCaches = getClassCaches()
  const classSet = new Set<string>()
  for (let i = 0; i < classCaches.length; i++) {
    const classCacheMap = classCaches[i]
    const keys = classCacheMap.keys()
    for (const key of keys) {
      classSet.add(key)
    }
  }
  return classSet
}
