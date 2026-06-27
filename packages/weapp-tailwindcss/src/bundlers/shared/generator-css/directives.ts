import type { TailwindCssDirectiveAnalysis } from '@weapp-tailwindcss/postcss'
import path from 'node:path'
import {
  analyzeTailwindCssDirectives,
  normalizeTailwindCssImportRequest as baseNormalizeTailwindCssImportRequest,
  isTailwindCssGenerationDirective,
  isTailwindCssImportAtRule,
  isTailwindCssPackageJsonImportRequest,
  parseTailwindCssConfigRequest,
  parseTailwindCssDirectiveRequest,
  postcss,
} from '@weapp-tailwindcss/postcss'
import {
  extractConfigRequestFromSource,
  extractTailwindDirectiveLines,
  extractTailwindSourceForPostcssFallback,
} from './directives/fallback'
import {
  GENERATOR_PLACEHOLDER_MARKER_RE,
  hasTailwindGeneratedCssMarkers,
  stripGeneratorPlaceholderMarkers,
} from './markers'

const TAILWIND_REMOVABLE_SOURCE_DIRECTIVE_NAMES = new Set([
  'config',
  'custom-variant',
  'layer',
  'plugin',
  'reference',
  'source',
  'tailwind',
  'theme',
  'utility',
  'variant',
])

const TAILWIND_ROOT_DIRECTIVE_RE = /@(?:import\s+(?:url\(\s*)?["']?tailwindcss4?(?:\/[^"')\s]*)?|(?:use|forward)\s+(?:url\(\s*)?["']?tailwindcss4?(?:\/[^"')\s]*)?|tailwind|config|custom-variant|plugin|source|theme|utility|variant)\b/

interface TailwindDirectiveOptions {
  importFallback?: boolean | undefined
}

interface TailwindGenerationDirectiveOptions extends TailwindDirectiveOptions {
  ignoreLayer?: boolean | undefined
}

export function parseImportRequest(params: string) {
  return parseTailwindCssDirectiveRequest(params)
}

export function hasLocalCssImport(rawSource: string) {
  return analyzeParseableTailwindDirectives(rawSource)?.hasLocalCssImport ?? false
}

function parseConfigRequest(params: string) {
  return parseTailwindCssConfigRequest(params)
}

function isPackageJsonImportRequest(request: string | undefined) {
  return isTailwindCssPackageJsonImportRequest(request)
}

function normalizeTailwindImportRequest(request: string | undefined, options: TailwindDirectiveOptions = {}) {
  return baseNormalizeTailwindCssImportRequest(request, options)
}

function replaceImportRequest(params: string, request: string, replacement: string) {
  const index = params.indexOf(request)
  if (index === -1) {
    return params
  }
  return `${params.slice(0, index)}${replacement}${params.slice(index + request.length)}`
}

function normalizeTailwindImportAtRules(root: postcss.Root, options: TailwindDirectiveOptions = {}) {
  if (!options.importFallback) {
    return false
  }

  let changed = false
  const seenCanonicalImports = new Set<string>()
  root.walkAtRules('import', (node) => {
    const request = parseImportRequest(node.params)
    const normalizedRequest = normalizeTailwindImportRequest(request, options)
    if (!normalizedRequest || !isTailwindImportRequest(normalizedRequest)) {
      return
    }
    const normalizedParams = request && normalizedRequest !== request
      ? replaceImportRequest(node.params, request, normalizedRequest)
      : node.params
    const normalizedKey = normalizedParams.trim()
    if (seenCanonicalImports.has(normalizedKey)) {
      node.remove()
      changed = true
      return
    }
    seenCanonicalImports.add(normalizedKey)
    if (normalizedParams !== node.params) {
      node.params = normalizedParams
      changed = true
    }
  })
  return changed
}

function resolveConfigPath(base: string, configPath: string) {
  if (path.isAbsolute(configPath) || isPackageJsonImportRequest(configPath)) {
    return path.isAbsolute(configPath) ? configPath : undefined
  }
  return path.resolve(base, configPath)
}

export function normalizeTailwindConfigDirectives(rawSource: string, base: string) {
  return rawSource.replace(/@config\s+(["'])(.+?)\1\s*;?/g, (full, quote: string, request: string) => {
    if (path.isAbsolute(request) || isPackageJsonImportRequest(request)) {
      return full
    }
    return `@config ${quote}${path.resolve(base, request).replace(/\\/g, '/')}${quote};`
  })
}

function hasPreprocessorOnlySyntax(rawSource: string) {
  return /(?:^|\n)\s*(?:\/\/|\$[\w-]+\s*:|@[\w-]+\s*:|@(?:mixin|include|function|use|forward)\b)/.test(rawSource)
}

export function normalizeTailwindSourceForGenerator(rawSource: string, options: TailwindDirectiveOptions = {}) {
  return hasPreprocessorOnlySyntax(rawSource)
    ? extractTailwindSourceForPostcssFallback(rawSource, options) ?? rawSource
    : rawSource
}

export function normalizeTailwindSourceDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  if (!options.importFallback) {
    return rawSource
  }
  try {
    const root = postcss.parse(rawSource)
    return normalizeTailwindImportAtRules(root, options) ? root.toString() : rawSource
  }
  catch {
    return extractTailwindSourceForPostcssFallback(rawSource, options) ?? rawSource
  }
}

function isTailwindImportRequest(request: string | undefined) {
  const normalized = normalizeTailwindImportRequest(request)
  return normalized === 'tailwindcss'
    || normalized === 'tailwindcss4'
    || normalized?.startsWith('tailwindcss/') === true
    || normalized?.startsWith('tailwindcss4/') === true
}

function isTailwindImportAtRule(node: postcss.AtRule, options: TailwindDirectiveOptions = {}) {
  return isTailwindCssImportAtRule(node, options)
}

function isTailwindSourceDirective(node: postcss.Node, options: TailwindDirectiveOptions = {}) {
  if (node.type !== 'atrule') {
    return false
  }
  const atRule = node as postcss.AtRule
  if (isTailwindImportAtRule(atRule, options)) {
    return true
  }
  if (atRule.name === 'import' && isPackageJsonImportRequest(parseImportRequest(atRule.params))) {
    return true
  }
  if (atRule.name === 'layer') {
    return !atRule.nodes || atRule.nodes.length === 0
  }
  return TAILWIND_REMOVABLE_SOURCE_DIRECTIVE_NAMES.has(atRule.name)
}

function hasGeneratedCssArtifacts(rawSource: string) {
  return hasTailwindGeneratedCssMarkers(rawSource) && !GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)
}

function isTailwindGenerationDirective(node: postcss.Node, options: TailwindGenerationDirectiveOptions = {}) {
  return isTailwindCssGenerationDirective(node, options)
}

function analyzeParseableTailwindDirectives(
  rawSource: string,
  options: TailwindGenerationDirectiveOptions = {},
): TailwindCssDirectiveAnalysis | undefined {
  try {
    const ignoreLayer = options.ignoreLayer ?? hasGeneratedCssArtifacts(rawSource)
    return analyzeTailwindCssDirectives(postcss.parse(rawSource), { ...options, ignoreLayer })
  }
  catch {
    return undefined
  }
}

export function removeTailwindSourceDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  try {
    const source = hasPreprocessorOnlySyntax(rawSource)
      ? extractTailwindSourceForPostcssFallback(rawSource, options)
      : stripGeneratorPlaceholderMarkers(rawSource)
    if (!source) {
      return ''
    }
    const root = postcss.parse(source)
    let removed = false
    root.walk((node) => {
      if (isTailwindSourceDirective(node, options)) {
        node.remove()
        removed = true
      }
    })
    return removed ? root.toString() : source
  }
  catch {
    return stripGeneratorPlaceholderMarkers(rawSource)
  }
}

export function hasTailwindSourceDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  if (GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)) {
    return true
  }
  return analyzeParseableTailwindDirectives(rawSource, options)?.hasTailwindSourceDirectives
    ?? extractTailwindDirectiveLines(rawSource, options).length > 0
}

export function hasTailwindNonRootGenerationDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  if (GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)) {
    return true
  }
  return analyzeParseableTailwindDirectives(rawSource, options)?.hasTailwindNonRootGenerationDirectives
    ?? /@(?:apply|config|custom-variant|plugin|source|theme|utility|variant)\b/.test(rawSource)
}

export function hasTailwindRootImportDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  if (!TAILWIND_ROOT_DIRECTIVE_RE.test(rawSource) && !(options.importFallback && rawSource.includes('weapp-tailwindcss'))) {
    return false
  }

  return analyzeParseableTailwindDirectives(rawSource, options)?.hasTailwindRootImportDirectives
    ?? extractTailwindDirectiveLines(rawSource, options).some(line => /@(?:import|use|forward)\b/.test(line))
}

export function hasTailwindRootDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  if (!TAILWIND_ROOT_DIRECTIVE_RE.test(rawSource) && !(options.importFallback && rawSource.includes('weapp-tailwindcss'))) {
    return false
  }

  return analyzeParseableTailwindDirectives(rawSource, options)?.hasTailwindRootDirectives
    ?? extractTailwindDirectiveLines(rawSource, options).length > 0
}

export function hasTailwindApplyDirective(rawSource: string) {
  if (!rawSource.includes('@apply')) {
    return false
  }

  const analysis = analyzeParseableTailwindDirectives(rawSource)
  if (analysis) {
    return analysis.hasTailwindApplyDirective
  }
  const fallback = extractTailwindSourceForPostcssFallback(rawSource)
  return typeof fallback === 'string' && /@apply\s[^;{}]+;/.test(fallback)
}

export function resolveCssEntrySource(
  rawSource: string,
  base: string,
  options: { removeConfig?: boolean, importFallback?: boolean } = {},
) {
  try {
    const root = postcss.parse(rawSource)
    const normalizedImports = normalizeTailwindImportAtRules(root, options)
    let found = false
    let config: string | undefined
    let configRequest: string | undefined
    let removedConfig = false
    const removeConfig = options.removeConfig ?? true
    const ignoreLayer = hasGeneratedCssArtifacts(rawSource)
    root.walk((node) => {
      if (isTailwindGenerationDirective(node, { ...options, ignoreLayer })) {
        found = true
      }
      if (node.type === 'atrule' && node.name === 'config') {
        const configPath = parseConfigRequest(node.params)
        if (configPath && !config) {
          configRequest = configPath
          config = resolveConfigPath(base, configPath)
        }
        if (removeConfig) {
          node.remove()
          removedConfig = true
        }
      }
    })
    if (!found) {
      return undefined
    }
    if (hasPreprocessorOnlySyntax(rawSource)) {
      const css = extractTailwindSourceForPostcssFallback(rawSource, { ...options, removeConfig })
      if (css) {
        return {
          css,
          config,
          configRequest,
          base,
        }
      }
    }
    return {
      css: removedConfig || normalizedImports ? root.toString() : rawSource,
      config,
      configRequest,
      base,
    }
  }
  catch {
    const css = extractTailwindSourceForPostcssFallback(rawSource, options)
    const configRequest = extractConfigRequestFromSource(rawSource)
    const config = configRequest ? resolveConfigPath(base, configRequest) : undefined
    return css
      ? {
          css,
          config,
          configRequest,
          base,
        }
      : undefined
  }
}
