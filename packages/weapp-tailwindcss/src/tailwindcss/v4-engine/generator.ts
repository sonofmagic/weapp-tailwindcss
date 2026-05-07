import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import path from 'node:path'
import postcss from 'postcss'
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from './candidates'
import { transformTailwindV4CssByTarget } from './miniprogram'
import { applyTailwindV3CompatibilityCss } from './tailwind-v3-compatibility'
import { createTailwindV4DefaultColorThemeCss } from './tailwind-v4-default-colors'

type TailwindV4ScanSourcePatterns = Exclude<NonNullable<TailwindV4GenerateOptions['scanSources']>, boolean>

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

function parseImportSourcePath(params: string) {
  const match = /\bsource\(\s*(['"])(.*?)\1\s*\)/.exec(params)
  return match?.[2]
}

function isTailwindCssImport(params: string) {
  return /^\s*(['"])tailwindcss(?:\/[^'"]*)?\1/.test(params)
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

function resolveImportSourceScanSources(source: TailwindV4ResolvedSource): TailwindV4ScanSourcePatterns | undefined {
  let importSourceBase: string | undefined
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
      const sourcePath = parseImportSourcePath(rule.params)
      if (sourcePath) {
        importSourceBase = resolveSourceBase(source.base, sourcePath)
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
  return resolveImportSourceScanSources(source) ?? scanSources
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
    const sourceCss = shouldApplyTailwindV3Compatibility
      ? applyTailwindV3CompatibilityCss(source.css)
      : target === 'weapp'
        ? applyMiniProgramTailwindV4DefaultColorCss(source.css)
        : source.css
    const candidates = target === 'weapp'
      ? filterUnsupportedMiniProgramTailwindV4Candidates(patchOptions.candidates)
      : patchOptions.candidates
    const engine = createPatchTailwindV4Engine(
      sourceCss === source.css ? source : { ...source, css: sourceCss },
    )
    const result = await engine.generate({
      scanSources: resolveScanSources(source, scanSources),
      ...patchOptions,
      candidates,
    })
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
