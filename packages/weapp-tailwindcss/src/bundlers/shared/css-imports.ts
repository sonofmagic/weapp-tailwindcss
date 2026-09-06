import type { AppType } from '@/types'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { parseCssImportSpecifier, quoteCssImportSpecifier } from '@/tailwindcss/v4-engine/css-import'

const tailwindcssImportRE = /^(?:tailwindcss|weapp-tailwindcss)(?:\/.*)?$/
const tailwindcssCssImportStatementRE = /(@import\s+(?:url\(\s*)?)(["'])((?:tailwindcss|weapp-tailwindcss)(?:\/[^"']*)?\$?)(\2\s*\)?)/gi

export function normalizeResolvedTailwindcssImports(code: string, pkgDir: string | undefined) {
  if (!pkgDir) {
    return code
  }
  const paths = /^[a-z]:[\\/]|^\\\\/i.test(pkgDir) ? path.win32 : path.posix
  const root = postcss.parse(code)
  let changed = false
  root.walkAtRules('import', (rule) => {
    const parsed = parseCssImportSpecifier(rule.params)
    if (!parsed || !paths.isAbsolute(parsed.specifier)) {
      return
    }
    const subpath = paths.relative(pkgDir, parsed.specifier)
    if (!['index.css', 'theme.css', 'utilities.css', 'preflight.css'].includes(subpath)) {
      return
    }
    // loader 解析后的包文件在生成边界恢复为包请求，不能作为浏览器 import 重新输出。
    const request = subpath === 'index.css' ? 'tailwindcss' : `tailwindcss/${subpath}`
    rule.params = rule.params.replace(parsed.raw, () => quoteCssImportSpecifier(request, parsed.quote))
    changed = true
  })
  return changed ? root.toString() : code
}

export interface ResolveTailwindcssImportOptions {
  join?: ((base: string, subpath: string) => string) | undefined
  appType?: AppType | undefined
  rootImport?: string | undefined
}

function normalizeTailwindcssSpecifier(specifier: string) {
  if (specifier === 'tailwindcss$' || specifier === 'weapp-tailwindcss$') {
    return specifier.slice(0, -1)
  }
  return specifier
}

function getTailwindcssSubpath(specifier: string) {
  if (specifier === 'tailwindcss' || specifier === 'weapp-tailwindcss') {
    return 'index.css'
  }
  return specifier.replace(/^(?:tailwindcss|weapp-tailwindcss)\//, '')
}

export function resolveTailwindcssImport(
  specifier: string,
  pkgDir: string,
  options?: ResolveTailwindcssImportOptions,
) {
  const normalized = normalizeTailwindcssSpecifier(specifier)
  if (!tailwindcssImportRE.test(normalized)) {
    return null
  }
  if (normalized === 'tailwindcss' || normalized === 'weapp-tailwindcss') {
    return options?.rootImport ?? (options?.join ?? path.join)(pkgDir, 'index.css')
  }
  const join = options?.join ?? path.join
  const subpath = getTailwindcssSubpath(normalized)
  return join(pkgDir, subpath)
}

export function rewriteTailwindcssImportsInCode(
  code: string,
  pkgDir: string,
  options?: ResolveTailwindcssImportOptions,
) {
  let hasReplacements = false
  const rewritten = code.replace(
    tailwindcssCssImportStatementRE,
    (full, prefix: string, quote: string, specifier: string, suffix: string) => {
      const replacement = resolveTailwindcssImport(specifier, pkgDir, options)
      if (!replacement) {
        return full
      }
      hasReplacements = true
      return `${prefix}${quote}${replacement}${suffix}`
    },
  )
  return hasReplacements ? rewritten : undefined
}
