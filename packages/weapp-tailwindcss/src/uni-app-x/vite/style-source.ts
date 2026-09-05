import type { parseVueRequest } from '@/bundlers/vite/query'
import { extractSfcStyleBlocks } from '@/bundlers/vite/generate-bundle/sfc-style-source'

const VITE_CSS_HMR_MODULE_RE = /\b(?:const\s+__vite__css\s*=|__vite__updateStyle\s*\()/

type VueStyleQuery = ReturnType<typeof parseVueRequest>['query']

export function resolveUniAppXStyleSource(code: string, query: VueStyleQuery) {
  // Vite 的 CSS HMR 模块可能没有 `vue&type=style` 查询参数，但其内容仍是
  // 包含完整 SFC/template 的包装代码。此类 payload 不能继续交给 PostCSS。
  if (VITE_CSS_HMR_MODULE_RE.test(code)) {
    return { skip: true as const }
  }
  if (!query.vue || query.type !== 'style') {
    return { code }
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
