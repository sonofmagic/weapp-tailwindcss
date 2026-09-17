import type { TailwindGenerationSessionPool } from '@/compiler/tailwind-generation-session-pool'
import type { TailwindResolvedSource } from '@/generator'
import { compileTailwindAuthorFunctions, createTailwindAuthorFunctionProbe } from '@weapp-tailwindcss/postcss'
import { md5Hash } from '@/cache/md5'

const AUTHOR_THEME_FUNCTION_RE = /(?:^|[^-\w])(?:theme|--theme)\(/
const AUTHOR_SPACING_FUNCTION_RE = /(?:--spacing|--alpha)\(/
const GENERATED_AUTHOR_FUNCTION_SKIP_MAX_LENGTH = 8192

/**
 * 判断这段 CSS 是否还需要走作者函数编译。
 *
 * `theme()` / `--theme()` 一定要编译。`--spacing()` / `--alpha()` 只在短小的作者 CSS 里保留；
 * 大段或带生成标记的样式里它们通常已是 Tailwind 工具输出，再 parse 会拖垮 generateBundle。
 */
export function shouldCompileAuthorCssFunctions(css: string) {
  if (AUTHOR_THEME_FUNCTION_RE.test(css)) {
    return true
  }
  if (!AUTHOR_SPACING_FUNCTION_RE.test(css)) {
    return false
  }
  return css.length <= GENERATED_AUTHOR_FUNCTION_SKIP_MAX_LENGTH
    && !css.includes('weapp-tailwindcss')
    && !css.includes('tailwindcss v4')
}

export function createAuthorCssFunctionCompiler(sources: TailwindResolvedSource[], session: TailwindGenerationSessionPool) {
  const cache = new Map<string, string>()
  return (css: string) => {
    if (!shouldCompileAuthorCssFunctions(css)) {
      return Promise.resolve(css)
    }
    return compileTailwindAuthorFunctions(css, async (values) => {
      const missing = [...new Set(values.filter(value => !cache.has(value)))]
      if (missing.length > 0) {
        let selector = `.weapp-author-functions-${md5Hash(missing.join('\0'))}`
        while (sources.some(source => source.css.includes(selector))) {
          selector += '-probe'
        }
        const probe = createTailwindAuthorFunctionProbe(missing, selector)
        let resolved: string[] | undefined
        for (const source of sources) {
          const result = await session.generate({ ...source, css: `${source.css}\n${probe.css}` }, {
            candidates: [],
            scanSources: false,
            incrementalCache: false,
            target: 'web',
          })
          const current = probe.read(result.rawCss)
          if (resolved && current.some((value, index) => value !== resolved![index])) {
            throw new Error('作者样式函数匹配到多个不同的 Tailwind 配置上下文，无法安全回填。')
          }
          resolved = current
        }
        if (!resolved) {
          throw new Error('作者样式函数缺少 Tailwind 编译上下文。')
        }
        missing.forEach((value, index) => cache.set(value, resolved![index]!))
      }
      return values.map(value => cache.get(value)!)
    })
  }
}
