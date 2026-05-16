import path from 'node:path'
import postcss from 'postcss'
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

const TAILWIND_ROOT_DIRECTIVE_NAMES = new Set([
  'config',
  'custom-variant',
  'plugin',
  'source',
  'tailwind',
  'theme',
  'utility',
  'variant',
])
const TAILWIND_ROOT_DIRECTIVE_RE = /@(?:import\s+(?:url\(\s*)?["']?tailwindcss4?(?:\/[^"')\s]*)?|tailwind|config|custom-variant|plugin|source|theme|utility|variant)\b/
const TAILWIND_EXTRACTABLE_DIRECTIVE_RE = /^\s*@(?:import|tailwind|config|source|reference|plugin)\b[\s\S]*?(?:;|$)/
const TAILWIND_EXTRACTABLE_BLOCK_DIRECTIVE_RE = /^\s*@(?:theme|utility|variant|custom-variant)\b[\s\S]*$/

interface TailwindDirectiveOptions {
  importFallback?: boolean | undefined
}

interface TailwindGenerationDirectiveOptions extends TailwindDirectiveOptions {
  ignoreLayer?: boolean | undefined
}

export function parseImportRequest(params: string) {
  const match = /^(?:url\(\s*)?(["']?)([^"')\s]+)\1\s*\)?/.exec(params.trim())
  return match?.[2]
}

function parseConfigRequest(params: string) {
  const match = /^(["'])(.+)\1\s*;?$/.exec(params.trim())
  return match?.[2]
}

function isPackageJsonImportRequest(request: string | undefined) {
  return typeof request === 'string' && request.startsWith('#')
}

function isWeappTailwindcssImportRequest(request: string | undefined) {
  return request === 'weapp-tailwindcss' || request?.startsWith('weapp-tailwindcss/')
}

function normalizeTailwindImportRequest(request: string | undefined, options: TailwindDirectiveOptions = {}) {
  if (options.importFallback && isWeappTailwindcssImportRequest(request)) {
    return request!.replace(/^weapp-tailwindcss/, 'tailwindcss')
  }
  return request
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

function normalizeTailwindDirectiveLine(line: string, options: TailwindDirectiveOptions = {}) {
  if (!options.importFallback || !line.trimStart().startsWith('@import')) {
    return line
  }
  const request = parseImportRequest(line.trimStart().replace(/^@import\b/, ''))
  if (!isWeappTailwindcssImportRequest(request)) {
    return line
  }
  return replaceImportRequest(line, request, request.replace(/^weapp-tailwindcss/, 'tailwindcss'))
}

function extractTailwindDirectiveLines(
  rawSource: string,
  options: TailwindDirectiveOptions & { removeConfig?: boolean } = {},
) {
  const directives: string[] = []
  const seenImports = new Set<string>()
  for (const line of stripGeneratorPlaceholderMarkers(rawSource).split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) {
      continue
    }
    const directive = TAILWIND_EXTRACTABLE_DIRECTIVE_RE.exec(line)?.[0]
      ?? TAILWIND_EXTRACTABLE_BLOCK_DIRECTIVE_RE.exec(line)?.[0]
    if (!directive) {
      continue
    }
    const normalized = normalizeTailwindDirectiveLine(directive.trimEnd(), options)
    const normalizedTrimmed = normalized.trim()
    if (options.removeConfig && normalizedTrimmed.startsWith('@config')) {
      continue
    }
    const request = /^@import\b/.test(normalizedTrimmed)
      ? parseImportRequest(normalizedTrimmed.replace(/^@import\b/, ''))
      : undefined
    if (request && !isTailwindImportRequest(request) && !isPackageJsonImportRequest(request)) {
      continue
    }
    if (/^@import\b/.test(normalizedTrimmed) && !request) {
      continue
    }
    if (request && isTailwindImportRequest(request)) {
      const key = normalizedTrimmed
      if (seenImports.has(key)) {
        continue
      }
      seenImports.add(key)
    }
    directives.push(normalized)
  }
  return directives
}

function extractTailwindSourceForPostcssFallback(
  rawSource: string,
  options: TailwindDirectiveOptions & { removeConfig?: boolean } = {},
) {
  const directives = extractTailwindDirectiveLines(rawSource, options)
  return directives.length > 0 ? directives.join('\n') : undefined
}

function extractConfigRequestFromSource(rawSource: string) {
  for (const line of rawSource.split(/\r?\n/)) {
    const match = /^\s*@config\b([\s\S]*?)(?:;|$)/.exec(line)
    const request = match ? parseConfigRequest(match[1] ?? '') : undefined
    if (request) {
      return request
    }
  }
  return undefined
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
  return request === 'tailwindcss'
    || request === 'tailwindcss4'
    || request?.startsWith('tailwindcss/')
    || request?.startsWith('tailwindcss4/')
}

function isTailwindImportAtRule(node: postcss.AtRule, options: TailwindDirectiveOptions = {}) {
  if (node.name === 'tailwind') {
    return true
  }
  if (node.name !== 'import') {
    return false
  }
  return isTailwindImportRequest(normalizeTailwindImportRequest(parseImportRequest(node.params), options))
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
  return TAILWIND_REMOVABLE_SOURCE_DIRECTIVE_NAMES.has(atRule.name)
}

function hasGeneratedCssArtifacts(rawSource: string) {
  return hasTailwindGeneratedCssMarkers(rawSource) && !GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)
}

function isTailwindGenerationDirective(node: postcss.Node, options: TailwindGenerationDirectiveOptions = {}) {
  if (node.type !== 'atrule') {
    return false
  }
  const atRule = node as postcss.AtRule
  const request = atRule.name === 'import'
    ? parseImportRequest(atRule.params)
    : atRule.name === 'config' || atRule.name === 'plugin' || atRule.name === 'reference'
      ? parseConfigRequest(atRule.params)
      : undefined
  return isTailwindImportAtRule(atRule, options)
    || isPackageJsonImportRequest(request)
    || atRule.name === 'apply'
    || (!options.ignoreLayer && atRule.name === 'layer')
    || atRule.name === 'config'
    || atRule.name === 'source'
}

export function removeTailwindSourceDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  try {
    if (hasPreprocessorOnlySyntax(rawSource)) {
      return ''
    }
    const source = stripGeneratorPlaceholderMarkers(rawSource)
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
  try {
    if (GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)) {
      return true
    }
    const root = postcss.parse(rawSource)
    let found = false
    const ignoreLayer = hasGeneratedCssArtifacts(rawSource)
    root.walk((node) => {
      if (isTailwindGenerationDirective(node, { ...options, ignoreLayer })) {
        found = true
        return false
      }
    })
    return found
  }
  catch {
    return extractTailwindDirectiveLines(rawSource, options).length > 0
  }
}

export function hasTailwindRootDirectives(rawSource: string, options: TailwindDirectiveOptions = {}) {
  if (!TAILWIND_ROOT_DIRECTIVE_RE.test(rawSource) && !(options.importFallback && rawSource.includes('weapp-tailwindcss'))) {
    return false
  }

  try {
    const root = postcss.parse(rawSource)
    let found = false
    root.walkAtRules((node) => {
      const request = node.name === 'import'
        ? parseImportRequest(node.params)
        : node.name === 'config' || node.name === 'plugin'
          ? parseConfigRequest(node.params)
          : undefined
      if (
        isTailwindImportAtRule(node, options)
        || isPackageJsonImportRequest(request)
        || TAILWIND_ROOT_DIRECTIVE_NAMES.has(node.name)
      ) {
        found = true
        return false
      }
    })
    return found
  }
  catch {
    return extractTailwindDirectiveLines(rawSource, options).length > 0
  }
}

export function hasTailwindApplyDirective(rawSource: string) {
  if (!rawSource.includes('@apply')) {
    return false
  }

  try {
    const root = postcss.parse(rawSource)
    let found = false
    root.walkAtRules('apply', () => {
      found = true
      return false
    })
    return found
  }
  catch {
    return false
  }
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
          config = isPackageJsonImportRequest(configPath)
            ? undefined
            : path.isAbsolute(configPath)
              ? configPath
              : path.resolve(base, configPath)
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
    const config = configRequest && !isPackageJsonImportRequest(configRequest)
      ? path.isAbsolute(configRequest)
        ? configRequest
        : path.resolve(base, configRequest)
      : undefined
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
