import path from 'path'
import fs from 'fs'

export function getContexts() {
  const cwd = process.cwd()
  //
  const distPath = path.join(cwd, 'node_modules', 'tailwindcss/lib')
  // index.js
  // plugin.js
  let injectFilePath = path.join(distPath, 'plugin.js')
  if (!fs.existsSync(injectFilePath)) {
    injectFilePath = path.join(distPath, 'index.js')
  }
  const p = require.resolve(injectFilePath)
  const mo = require(p)
  if (mo.contextRef) {
    return mo.contextRef.value as any[]
  }
  return []

  // processTailwindFeatures return content
}

export function getClassCache() {
  const cwd = process.cwd()
  // path.join(cwd, 'node_modules', 'tailwindcss/lib')
  const distPath = path.join(cwd, 'node_modules', 'tailwindcss/lib')
  // index.js
  // plugin.js
  let injectFilePath = path.join(distPath, 'plugin.js')
  if (!fs.existsSync(injectFilePath)) {
    injectFilePath = path.join(distPath, 'index.js')
  }
  const p = require.resolve(injectFilePath)
  const mo = require(p)
  if (mo.contextRef) {
    return (mo.contextRef.value as any[]).map((x) => x.classCache)
  }
  return []
  // processTailwindFeatures return content
}
