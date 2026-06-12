import type { TailwindV4GenerateTarget, TailwindV4ResolvedSource } from '../types'
import { postcss } from '@weapp-tailwindcss/postcss'
import { applyTailwindV3CompatibilityCss } from '../tailwind-v3-compatibility'
import { createTailwindV4DefaultColorThemeCss } from '../tailwind-v4-default-colors'

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

function applyMiniProgramTailwindV4DefaultColorCss(css: string) {
  const themeCss = createTailwindV4DefaultColorThemeCss()
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

function hasImportLayerOption(params: string) {
  return /\blayer(?:\s*\(|\s*$)/.test(params)
}

function removeUnlayeredTailwindV4PreflightImports(css: string) {
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
    if (isTailwindCssPreflightImport(rule.params) && !hasImportLayerOption(rule.params)) {
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
  tailwindcssV3Compatibility: boolean | undefined,
) {
  const shouldApplyTailwindV3Compatibility = tailwindcssV3Compatibility ?? target === 'weapp'
  const filteredSourceCss = target === 'weapp'
    ? removeUnlayeredTailwindV4PreflightImports(source.css)
    : source.css
  const sourceCss = shouldApplyTailwindV3Compatibility
    ? applyTailwindV3CompatibilityCss(filteredSourceCss)
    : target === 'weapp'
      ? applyMiniProgramTailwindV4DefaultColorCss(filteredSourceCss)
      : filteredSourceCss
  const compatibleSourceCss = removeUnsupportedThemeVendorKeyframes(sourceCss)
  return compatibleSourceCss === source.css ? source : { ...source, css: compatibleSourceCss }
}
