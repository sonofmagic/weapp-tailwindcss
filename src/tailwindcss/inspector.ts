import path from 'path'
export function getContexts() {
  const injectFilePath = path.join(process.cwd(), 'node_modules', 'tailwindcss/lib/index.js')
  const p = require.resolve(injectFilePath)
  const mo = require(p)
  return (mo.contextRef.value as any[]).map(x => x.classCache)
  // processTailwindFeatures return content
}