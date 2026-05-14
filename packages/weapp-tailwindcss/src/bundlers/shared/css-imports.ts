import type { AppType } from '@/types'
import path from 'node:path'

const tailwindcssImportRE = /^(?:tailwindcss|weapp-tailwindcss)(?:\/.*)?$/
const tailwindcssCssImportStatementRE = /(@import\s+(?:url\(\s*)?)(["'])((?:tailwindcss|weapp-tailwindcss)(?:\/[^"']*)?\$?)(\2\s*\)?)/gi

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
