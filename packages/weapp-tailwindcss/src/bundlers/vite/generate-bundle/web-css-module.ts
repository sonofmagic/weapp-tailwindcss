import { normalizeOutputPathKey } from '../../shared/module-graph'

/** 仅替换 transform 阶段标记的模块区间，保留 bundler 合并的前后样式及其层叠顺序。 */
export function replaceWebCssModule(source: string, sourceFile: string, generated: string) {
  const markers = [...source.matchAll(/\/\*!?\s*weapp-tailwindcss vite-generated-css(-end)?\s*:\s*([^\s*]+)\s*\*\//gi)]
  const sourceKey = normalizeOutputPathKey(sourceFile.replace(/[?#].*$/, ''))
  let cursor = 0
  let result = ''
  let replaced = false
  for (let index = 0; index < markers.length; index++) {
    const start = markers[index]!
    const end = markers[index + 1]
    if (start[1] || !end?.[1] || start[2] !== end[2]) {
      continue
    }
    if (normalizeOutputPathKey(decodeURIComponent(start[2]!)) !== sourceKey) {
      continue
    }
    result += source.slice(cursor, start.index) + generated
    cursor = end.index! + end[0].length
    replaced = true
    index++
  }
  return replaced ? result + source.slice(cursor) : undefined
}
