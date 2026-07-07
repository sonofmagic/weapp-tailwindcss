import type { TailwindV4GenerateTarget, TailwindV4ResolvedSource } from '../types'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { createTailwindV4DefaultColorThemeCss } from '../tailwind-v4-default-colors'

const require = createRequire(import.meta.url)
const tailwindThemeCssCache = new Map<string, string>()

function findLeadingImportInsertionIndex(css: string) {
  const importPattern = /(?:^|\n)\s*@import\b[^;]*;/g
  let insertionIndex = 0
  let match = importPattern.exec(css)
  while (match !== null) {
    insertionIndex = match.index + match[0].length
    match = importPattern.exec(css)
  }
  return insertionIndex
}

function readCachedCss(file: string) {
  const cached = tailwindThemeCssCache.get(file)
  if (cached !== undefined) {
    return cached
  }
  const css = readFileSync(file, 'utf8')
  tailwindThemeCssCache.set(file, css)
  return css
}

function resolveTailwindV4ThemeCssFromImport(css: string) {
  const root = postcss.parse(css)
  let resolved: string | undefined
  root.walkAtRules('import', (rule) => {
    if (resolved) {
      return
    }
    const specifier = parseCssImportSpecifier(rule.params)
    if (!specifier || !path.isAbsolute(specifier) || path.basename(specifier) !== 'index.css') {
      return
    }
    const themeCss = path.join(path.dirname(specifier), 'theme.css')
    if (existsSync(themeCss)) {
      resolved = themeCss
    }
  })
  return resolved
}

function resolveTailwindV4ThemeCssFromBase(base: string) {
  try {
    const requireFromBase = createRequire(path.join(base, 'package.json'))
    return requireFromBase.resolve('tailwindcss/theme.css')
  }
  catch {
    try {
      return require.resolve('tailwindcss/theme.css')
    }
    catch {
      return undefined
    }
  }
}

function resolveTailwindV4DefaultThemeCss(source: TailwindV4ResolvedSource) {
  try {
    const themeCss = resolveTailwindV4ThemeCssFromImport(source.css)
      ?? resolveTailwindV4ThemeCssFromBase(source.base)
    return themeCss ? readCachedCss(themeCss) : createTailwindV4DefaultColorThemeCss()
  }
  catch {
    return createTailwindV4DefaultColorThemeCss()
  }
}

function applyMiniProgramTailwindV4DefaultColorCss(css: string, source: TailwindV4ResolvedSource) {
  const themeCss = resolveTailwindV4DefaultThemeCss(source)
  const insertionIndex = findLeadingImportInsertionIndex(css)
  if (insertionIndex === 0) {
    return `${themeCss}\n${css}`
  }
  return `${css.slice(0, insertionIndex)}\n${themeCss}\n${css.slice(insertionIndex)}`
}

function parseCssImportSpecifier(params: string) {
  const value = params.trim()
  const quoted = /^(['"])(.*?)\1/.exec(value)
  if (quoted) {
    return quoted[2]
  }

  const url = /^url\(\s*(?:(['"])(.*?)\1|([^'")\s]+))\s*\)/.exec(value)
  return url?.[2] ?? url?.[3]
}

function isTailwindCssPreflightImport(params: string) {
  const specifier = parseCssImportSpecifier(params)
  return specifier === 'tailwindcss/preflight.css' || specifier === 'tailwindcss/preflight'
}

function removeTailwindV4PreflightImports(css: string) {
  if (!css.includes('preflight')) {
    return css
  }

  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return css
  }

  let changed = false
  root.walkAtRules('import', (rule) => {
    if (isTailwindCssPreflightImport(rule.params)) {
      rule.remove()
      changed = true
    }
  })

  return changed ? root.toString() : css
}

function hasThemeParent(rule: postcss.AtRule) {
  let parent = rule.parent as postcss.Container | undefined
  while (parent) {
    if (parent.type === 'atrule' && (parent as postcss.AtRule).name === 'theme') {
      return true
    }
    parent = parent.parent as postcss.Container | undefined
  }
  return false
}

function isVendorPrefixedKeyframes(rule: postcss.AtRule) {
  return rule.name.startsWith('-') && rule.name.endsWith('keyframes')
}

function removeUnsupportedThemeVendorKeyframes(css: string) {
  if (!css.includes('@theme') || !css.includes('@-')) {
    return css
  }

  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return css
  }

  let changed = false
  root.walkAtRules((rule) => {
    if (isVendorPrefixedKeyframes(rule) && hasThemeParent(rule)) {
      rule.remove()
      changed = true
    }
  })

  return changed ? root.toString() : css
}

export function createCompatibleSource(
  source: TailwindV4ResolvedSource,
  target: TailwindV4GenerateTarget,
) {
  const filteredSourceCss = target === 'weapp'
    ? removeTailwindV4PreflightImports(source.css)
    : source.css
  const sourceCss = target === 'weapp'
    ? applyMiniProgramTailwindV4DefaultColorCss(filteredSourceCss, source)
    : filteredSourceCss
  const compatibleSourceCss = removeUnsupportedThemeVendorKeyframes(sourceCss)
  return compatibleSourceCss === source.css ? source : { ...source, css: compatibleSourceCss }
}
