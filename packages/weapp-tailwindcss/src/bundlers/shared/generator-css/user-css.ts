import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import { postcss, removeUnsupportedCascadeLayers } from '@weapp-tailwindcss/postcss'
import { removeUnsupportedMiniProgramAtRules } from '../css-cleanup'
import {
  hasTailwindApplyDirective,
  hasTailwindRootDirectives,
  removeTailwindSourceDirectives,
} from './directives'

const TAILWIND_V4_GENERATOR_AT_RULES = new Set([
  'config',
  'custom-variant',
  'plugin',
  'source',
  'theme',
  'utility',
  'variant',
])

function removeTailwindApplyAtRules(source: string) {
  if (!source.includes('@apply')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('apply', (rule) => {
      rule.remove()
      changed = true
    })
    root.walk((node) => {
      if ('nodes' in node && node.nodes?.length === 0) {
        node.remove()
      }
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export function removeTailwindV4GeneratorAtRules(source: string) {
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules((rule) => {
      if (!TAILWIND_V4_GENERATOR_AT_RULES.has(rule.name)) {
        return
      }
      rule.remove()
      changed = true
    })
    root.walk((node) => {
      if ('nodes' in node && node.nodes?.length === 0) {
        node.remove()
        changed = true
      }
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

function isCommentOnlyCss(source: string) {
  try {
    const root = postcss.parse(source)
    return root.nodes.length > 0 && root.nodes.every(node => node.type === 'comment')
  }
  catch {
    return false
  }
}

function unwrapMiniProgramCascadeLayers(source: string) {
  if (!source.includes('@layer')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    removeUnsupportedCascadeLayers(root)
    return root.toString()
  }
  catch {
    return source
  }
}

export function stripTailwindSourceMediaFragments(source: string) {
  let removedSourceMediaStart = false
  return source
    .split(/\r?\n/)
    .filter((line) => {
      if (/^\s*@media\s+source\([^)]*\)\s*\{\s*$/.test(line)) {
        removedSourceMediaStart = true
        return false
      }
      if (/^\s*\}\s*\/\*\s*source\([^)]*\)\s*\*\/\s*$/.test(line)) {
        return false
      }
      if (removedSourceMediaStart && /^\s*\}\s*$/.test(line)) {
        removedSourceMediaStart = false
        return false
      }
      return true
    })
    .join('\n')
    .replace(/\}[^\S\r\n]*(?=@(?:config|source)\b)/g, '')
}

function stripLeadingTailwindSourceMediaCloseFragment(source: string) {
  return source.replace(/^\s*\}\s*(?:\n|$)/, '')
}

export function stripUnmatchedTailwindSourceMediaCloseFragments(source: string) {
  try {
    postcss.parse(source)
    return source
  }
  catch {
    return stripLeadingTailwindSourceMediaCloseFragment(source)
      .replace(/\s*\}\s*$/, '')
  }
}

export function splitUserCssLayerBlocks(source: string) {
  if (!source.includes('@layer')) {
    return {
      layer: '',
      rest: source,
    }
  }

  try {
    const root = postcss.parse(source)
    const layerRoot = postcss.root()
    const restRoot = postcss.root()
    for (const node of root.nodes) {
      const target = node.type === 'atrule' && node.name === 'layer' && node.nodes?.length
        ? layerRoot
        : restRoot
      target.append(node.clone())
    }
    return {
      layer: layerRoot.toString(),
      rest: restRoot.toString(),
    }
  }
  catch {
    return {
      layer: source,
      rest: '',
    }
  }
}

export function hasUserCssLayerBlocks(source: string) {
  if (!source.includes('@layer')) {
    return false
  }

  try {
    let hasLayerBlock = false
    postcss.parse(source).walkAtRules('layer', (node) => {
      if (node.nodes?.length) {
        hasLayerBlock = true
      }
    })
    return hasLayerBlock
  }
  catch {
    return true
  }
}

function collectUserLayerSelectors(source: string) {
  const selectors = new Set<string>()
  try {
    postcss.parse(source).walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        const normalized = selector.trim()
        if (normalized) {
          selectors.add(normalized)
        }
      }
    })
  }
  catch {
  }
  return selectors
}

function matchesUserLayerSelector(selector: string, userLayerSelector: string) {
  if (selector === userLayerSelector) {
    return true
  }
  if (!selector.startsWith(userLayerSelector)) {
    return false
  }
  const next = selector[userLayerSelector.length]
  return next === ':' || next === '['
}

export function extractGeneratedCssForUserLayerSelectors(css: string, userLayerSource: string) {
  const selectors = collectUserLayerSelectors(userLayerSource)
  if (selectors.size === 0) {
    return {
      layer: '',
      rest: css,
    }
  }

  try {
    const root = postcss.parse(css)
    const layerRoot = postcss.root()
    const selectorList = [...selectors]
    root.walkRules((rule) => {
      const ruleSelectors = rule.selectors ?? [rule.selector]
      if (ruleSelectors.some(selector => selectorList.some(userSelector => matchesUserLayerSelector(selector.trim(), userSelector)))) {
        layerRoot.append(rule.clone())
        rule.remove()
      }
    })
    return {
      layer: layerRoot.toString(),
      rest: root.toString(),
    }
  }
  catch {
    return {
      layer: '',
      rest: css,
    }
  }
}

function normalizeGeneratedSelector(selector: string) {
  return selector.replace(/:not\(#\\#\)/g, '').trim()
}

function collectApplyOnlySourceSelectors(source: string) {
  const selectors = new Set<string>()
  try {
    postcss.parse(source).walkRules((rule) => {
      if (!rule.nodes?.some(node => node.type === 'atrule' && node.name === 'apply')) {
        return
      }
      for (const selector of rule.selectors ?? [rule.selector]) {
        const normalized = normalizeGeneratedSelector(selector)
        if (normalized) {
          selectors.add(normalized)
        }
      }
    })
  }
  catch {
  }
  return selectors
}

function hasOnlyApplyBackedSourceRules(source: string) {
  let hasApplyRule = false
  let hasNonApplyRule = false
  try {
    postcss.parse(source).walkRules((rule) => {
      if (rule.nodes?.some(node => node.type === 'atrule' && node.name === 'apply')) {
        hasApplyRule = true
      }
      else {
        hasNonApplyRule = true
      }
    })
  }
  catch {
    return false
  }
  return hasApplyRule && !hasNonApplyRule
}

export function filterApplyOnlyGeneratedCss(css: string, source: string) {
  const selectors = collectApplyOnlySourceSelectors(source)
  if (selectors.size === 0) {
    return css
  }
  const selectorList = [...selectors]

  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const ruleSelectors = rule.selectors ?? [rule.selector]
      const isApplySelector = ruleSelectors.some((selector) => {
        const normalized = normalizeGeneratedSelector(selector)
        return selectorList.some((sourceSelector) => {
          if (normalized === sourceSelector) {
            return true
          }
          if (!normalized.startsWith(sourceSelector)) {
            return false
          }
          const next = normalized[sourceSelector.length]
          return next === ':' || next === '[' || next === '.'
        })
      })
      const isVariableRule = rule.nodes?.some(node => node.type === 'decl' && node.prop.startsWith('--'))
      if (!isApplySelector && !isVariableRule) {
        rule.remove()
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
      }
    })
    return root.toString()
  }
  catch {
    return css
  }
}

export function shouldFilterApplyOnlyGeneratedCss(
  majorVersion: number | undefined,
  target: string,
  source: string,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
  },
) {
  return majorVersion === 4
    && target === 'weapp'
    && hasTailwindApplyDirective(source)
    && !hasTailwindRootDirectives(source)
    && !options.hasGeneratedCss
    && !options.hasGeneratedMarkers
    && collectApplyOnlySourceSelectors(source).size > 0
    && hasOnlyApplyBackedSourceRules(source)
}

export async function transformGeneratorUserCss(
  source: string,
  options: {
    generatorTarget: string
    generatorStyleOptions: Partial<IStyleHandlerOptions>
    cssUserHandlerOptions: IStyleHandlerOptions
    styleHandler: InternalUserDefinedOptions['styleHandler']
    importFallback: boolean
  },
) {
  if (source.trim().length === 0) {
    return ''
  }
  const repairedSource = stripUnmatchedTailwindSourceMediaCloseFragments(
    stripTailwindSourceMediaFragments(source),
  )
  const cleanedSource = removeTailwindSourceDirectives(
    removeTailwindV4GeneratorAtRules(repairedSource),
    {
      importFallback: options.importFallback,
    },
  )
  if (cleanedSource.trim().length === 0) {
    return ''
  }
  const sanitizedSource = removeTailwindSourceDirectives(
    stripUnmatchedTailwindSourceMediaCloseFragments(
      stripTailwindSourceMediaFragments(options.generatorTarget === 'weapp'
        ? removeUnsupportedMiniProgramAtRules(unwrapMiniProgramCascadeLayers(cleanedSource))
        : cleanedSource),
    ),
    {
      importFallback: options.importFallback,
    },
  )
  const userSource = stripUnmatchedTailwindSourceMediaCloseFragments(removeTailwindApplyAtRules(sanitizedSource))
  if (userSource.trim().length === 0) {
    return ''
  }
  if (isCommentOnlyCss(userSource)) {
    return userSource
  }
  if (options.generatorTarget !== 'weapp') {
    return userSource
  }
  const { css } = await options.styleHandler(userSource, {
    ...options.generatorStyleOptions,
    ...options.cssUserHandlerOptions,
  })
  return removeUnsupportedMiniProgramAtRules(css)
}
