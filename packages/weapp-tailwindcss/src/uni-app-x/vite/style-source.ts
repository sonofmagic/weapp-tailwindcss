import type { parseVueRequest } from '@/bundlers/vite/query'
import { extractSfcStyleBlocks } from '@/bundlers/vite/generate-bundle/sfc-style-source'

const VITE_CSS_HMR_MODULE_RE = /\b(?:const\s+__vite__css\s*=|__vite__updateStyle\s*\()/

type VueStyleQuery = ReturnType<typeof parseVueRequest>['query']

export function resolveUniAppXStyleSource(code: string, query: VueStyleQuery) {
  if (!query.vue || query.type !== 'style') {
    return { code }
  }
  if (VITE_CSS_HMR_MODULE_RE.test(code)) {
    return { skip: true as const }
  }
  const styleBlocks = extractSfcStyleBlocks(code)
  if (styleBlocks.length === 0) {
    return { code }
  }
  const style = styleBlocks[query.index ?? 0]
  return style ? { code: style.source } : { skip: true as const }
}

export function hasUniAppXImportantApply(source: string, normalize: (source: string) => string) {
  return extractSfcStyleBlocks(source).some(style => normalize(style.source) !== style.source)
}
