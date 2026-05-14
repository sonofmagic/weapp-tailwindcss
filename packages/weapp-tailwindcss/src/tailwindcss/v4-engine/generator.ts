import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import path from 'node:path'
import postcss from 'postcss'
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { omitUndefined } from '@/utils/object'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from './candidates'
import { transformTailwindV4CssByTarget } from './miniprogram'
import { applyTailwindV3CompatibilityCss } from './tailwind-v3-compatibility'
import { createTailwindV4DefaultColorThemeCss } from './tailwind-v4-default-colors'

type TailwindV4ScanSourcePatterns = Exclude<NonNullable<TailwindV4GenerateOptions['scanSources']>, boolean>
type TailwindV4ResolvedScanSources = TailwindV4GenerateOptions['scanSources']

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

function parseImportSourceParam(params: string) {
  const match = /\bsource\(\s*(none|(['"])(.*?)\2)\s*\)/.exec(params)
  if (!match) {
    return undefined
  }
  return {
    none: match[1] === 'none',
    sourcePath: match[3],
  }
}

function isTailwindCssImport(params: string) {
  return /^\s*(['"])tailwindcss(?:\/[^'"]*)?\1/.test(params)
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

function parseSourceFileParam(params: string) {
  const value = params.trim()
  if (!value || value === 'none' || value.startsWith('inline(')) {
    return undefined
  }

  const negated = value.startsWith('not ')
  const sourceValue = negated ? value.slice(4).trim() : value
  if (sourceValue.startsWith('inline(')) {
    return undefined
  }

  const match = /^(['"])(.+)\1$/.exec(sourceValue)
  return match?.[2]
    ? {
        negated,
        pattern: match[2],
      }
    : undefined
}

function resolveSourceBase(base: string, sourcePath: string) {
  return path.isAbsolute(sourcePath) ? sourcePath : path.resolve(base, sourcePath)
}

function resolveCssDefinedScanSources(source: TailwindV4ResolvedSource): TailwindV4ResolvedScanSources | undefined {
  let importSourceBase: string | undefined
  let hasSourceNone = false
  const sourcePatterns: TailwindV4ScanSourcePatterns = []
  const from = source.dependencies[0]
  let root: postcss.Root
  try {
    root = postcss.parse(source.css, { from })
  }
  catch {
    return undefined
  }

  root.walkAtRules((rule) => {
    if (rule.name === 'import') {
      if (!isTailwindCssImport(rule.params)) {
        return
      }
      const sourceParam = parseImportSourceParam(rule.params)
      if (sourceParam?.none) {
        hasSourceNone = true
      }
      if (sourceParam?.sourcePath) {
        importSourceBase = resolveSourceBase(source.base, sourceParam.sourcePath)
      }
      return
    }

    if (rule.name !== 'source') {
      return
    }

    const sourcePattern = parseSourceFileParam(rule.params)
    if (!sourcePattern) {
      return
    }

    sourcePatterns.push({
      base: source.base,
      negated: sourcePattern.negated,
      pattern: sourcePattern.pattern,
    })
  })

  if (!importSourceBase) {
    if (hasSourceNone) {
      return sourcePatterns.length > 0 ? sourcePatterns : false
    }
    return undefined
  }

  return [
    {
      base: importSourceBase,
      negated: false,
      pattern: '**/*',
    },
    ...sourcePatterns,
  ]
}

function resolveScanSources(
  source: TailwindV4ResolvedSource,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  if (scanSources !== true) {
    return scanSources
  }
  return resolveCssDefinedScanSources(source) ?? scanSources
}

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  async function generate(options: TailwindV4GenerateOptions = {}) {
    const {
      scanSources = true,
      styleOptions,
      tailwindcssV3Compatibility,
      target = 'weapp',
      ...patchOptions
    } = options
    const shouldApplyTailwindV3Compatibility = tailwindcssV3Compatibility ?? target === 'weapp'
    const filteredSourceCss = target === 'weapp'
      ? removeUnlayeredTailwindV4PreflightImports(source.css)
      : source.css
    const sourceCss = shouldApplyTailwindV3Compatibility
      ? applyTailwindV3CompatibilityCss(filteredSourceCss)
      : target === 'weapp'
        ? applyMiniProgramTailwindV4DefaultColorCss(filteredSourceCss)
        : filteredSourceCss
    const candidates = target === 'weapp'
      ? filterUnsupportedMiniProgramTailwindV4Candidates(patchOptions.candidates)
      : patchOptions.candidates
    const engine = createPatchTailwindV4Engine(
      sourceCss === source.css ? source : { ...source, css: sourceCss },
    )
    const result = await engine.generate(omitUndefined({
      scanSources: resolveScanSources(source, scanSources),
      ...patchOptions,
      candidates,
    }))
    const rawCss = result.css
    const css = await transformTailwindV4CssByTarget(rawCss, target, styleOptions)

    return {
      ...result,
      css,
      rawCss,
      target,
    }
  }

  return {
    source,
    loadDesignSystem: createPatchTailwindV4Engine(source).loadDesignSystem,
    validateCandidates: createPatchTailwindV4Engine(source).validateCandidates,
    generate,
  }
}
