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

function isTailwindImportAtRule(node: postcss.AtRule) {
  if (node.name === 'tailwind') {
    return true
  }
  if (node.name !== 'import') {
    return false
  }
  const request = parseImportRequest(node.params)
  return request === 'tailwindcss'
    || request === 'tailwindcss4'
    || request?.startsWith('tailwindcss/')
    || request?.startsWith('tailwindcss4/')
}

function isTailwindSourceDirective(node: postcss.Node) {
  if (node.type !== 'atrule') {
    return false
  }
  const atRule = node as postcss.AtRule
  if (isTailwindImportAtRule(atRule)) {
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

function isTailwindGenerationDirective(node: postcss.Node, options: { ignoreLayer?: boolean } = {}) {
  if (node.type !== 'atrule') {
    return false
  }
  const atRule = node as postcss.AtRule
  const request = atRule.name === 'import'
    ? parseImportRequest(atRule.params)
    : atRule.name === 'config' || atRule.name === 'plugin' || atRule.name === 'reference'
      ? parseConfigRequest(atRule.params)
      : undefined
  return isTailwindImportAtRule(atRule)
    || isPackageJsonImportRequest(request)
    || atRule.name === 'apply'
    || (!options.ignoreLayer && atRule.name === 'layer')
    || atRule.name === 'config'
    || atRule.name === 'source'
}

export function removeTailwindSourceDirectives(rawSource: string) {
  try {
    const source = stripGeneratorPlaceholderMarkers(rawSource)
    const root = postcss.parse(source)
    let removed = false
    root.walk((node) => {
      if (isTailwindSourceDirective(node)) {
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

export function hasTailwindSourceDirectives(rawSource: string) {
  try {
    if (GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)) {
      return true
    }
    const root = postcss.parse(rawSource)
    let found = false
    const ignoreLayer = hasGeneratedCssArtifacts(rawSource)
    root.walk((node) => {
      if (isTailwindGenerationDirective(node, { ignoreLayer })) {
        found = true
        return false
      }
    })
    return found
  }
  catch {
    return false
  }
}

export function hasTailwindRootDirectives(rawSource: string) {
  if (!TAILWIND_ROOT_DIRECTIVE_RE.test(rawSource)) {
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
        isTailwindImportAtRule(node)
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
    return true
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
  options: { removeConfig?: boolean } = {},
) {
  try {
    const root = postcss.parse(rawSource)
    let found = false
    let config: string | undefined
    let configRequest: string | undefined
    let removedConfig = false
    const removeConfig = options.removeConfig ?? true
    const ignoreLayer = hasGeneratedCssArtifacts(rawSource)
    root.walk((node) => {
      if (isTailwindGenerationDirective(node, { ignoreLayer })) {
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
    return {
      css: removedConfig ? root.toString() : rawSource,
      config,
      configRequest,
      base,
    }
  }
  catch {
    return undefined
  }
}
