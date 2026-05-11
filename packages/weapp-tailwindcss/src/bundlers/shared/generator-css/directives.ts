import path from 'node:path'
import postcss from 'postcss'
import {
  GENERATOR_PLACEHOLDER_MARKER_RE,
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
  if (isTailwindImportAtRule(node)) {
    return true
  }
  if (node.name === 'import' && isPackageJsonImportRequest(parseImportRequest(node.params))) {
    return true
  }
  return TAILWIND_REMOVABLE_SOURCE_DIRECTIVE_NAMES.has(node.name)
}

function isTailwindGenerationDirective(node: postcss.Node) {
  if (node.type !== 'atrule') {
    return false
  }
  const request = node.name === 'import'
    ? parseImportRequest(node.params)
    : node.name === 'config' || node.name === 'plugin' || node.name === 'reference'
      ? parseConfigRequest(node.params)
      : undefined
  return isTailwindImportAtRule(node)
    || isPackageJsonImportRequest(request)
    || node.name === 'apply'
    || node.name === 'layer'
    || node.name === 'config'
    || node.name === 'source'
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
    root.walk((node) => {
      if (isTailwindGenerationDirective(node)) {
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
    root.walk((node) => {
      if (isTailwindGenerationDirective(node)) {
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
