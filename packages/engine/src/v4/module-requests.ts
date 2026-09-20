import path from 'node:path'
import postcss from 'postcss'

/** 相对请求让 Tailwind Node 跟踪模块依赖并使用其 ESM 缓存失效协议。 */
export function normalizeGenerationModuleRequests(css: string, base: string) {
  if (!css.includes('@config') && !css.includes('@plugin')) {
    return css
  }
  const root = postcss.parse(css)
  root.walkAtRules((rule) => {
    if (rule.name !== 'config' && rule.name !== 'plugin') {
      return
    }
    const match = /^(["'])(.*)\1$/.exec(rule.params.trim())
    if (!match) {
      return
    }
    const request = match[2]!
    const pathApi = /^[a-z]:[\\/]/i.test(base) || base.includes('\\') ? path.win32 : path
    if (!pathApi.isAbsolute(request)) {
      return
    }
    const relative = pathApi.relative(base, request)
    // 跨盘符不能表达为相对路径，保持原请求交给上游解析。
    if (pathApi.isAbsolute(relative)) {
      return
    }
    const specifier = relative.replaceAll('\\', '/')
    rule.params = JSON.stringify(specifier.startsWith('.') ? specifier : `./${specifier}`)
  })
  return root.toString()
}
