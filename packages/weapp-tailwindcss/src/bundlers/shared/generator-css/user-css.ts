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

function removeBalancedAtRuleBlock(source: string, atRuleStart: number) {
  const blockStart = source.indexOf('{', atRuleStart)
  if (blockStart === -1) {
    const semicolon = source.indexOf(';', atRuleStart)
    return semicolon === -1 ? source.slice(0, atRuleStart) : `${source.slice(0, atRuleStart)}${source.slice(semicolon + 1)}`
  }
  let depth = 0
  for (let index = blockStart; index < source.length; index++) {
    const char = source[index]
    if (char === '{') {
      depth++
      continue
    }
    if (char !== '}') {
      continue
    }
    depth--
    if (depth === 0) {
      return `${source.slice(0, atRuleStart)}${source.slice(index + 1)}`
    }
  }
  return source.slice(0, atRuleStart)
}

function removeTailwindV4GeneratorAtRulesFallback(source: string) {
  let next = source
  let changed = false
  const sourceMediaRE = /@media\s+source\([^)]*\)\s*\{/g
  for (;;) {
    sourceMediaRE.lastIndex = 0
    const match = sourceMediaRE.exec(next)
    if (!match) {
      break
    }
    next = removeBalancedAtRuleBlock(next, match.index)
    changed = true
  }
  const atRuleRE = /@(?:config|custom-variant|plugin|source|theme|utility|variant)\b/g
  for (;;) {
    atRuleRE.lastIndex = 0
    const match = atRuleRE.exec(next)
    if (!match) {
      break
    }
    next = removeBalancedAtRuleBlock(next, match.index)
    changed = true
  }
  return changed ? next : source
}

function isTailwindGeneratedPreflightComment(text: string) {
  return text.includes('cssremedy')
    || text.includes('Use the user\'s configured')
    || text.includes('tailwindlabs/tailwindcss')
    || text.includes('Prevent padding and border from affecting element width')
    || text.includes('Remove default margins and padding')
    || text.includes('Deprecated')
    || text.includes('Reset all borders')
    || text.includes('Add the correct text decoration')
    || text.includes('Make elements with the HTML hidden attribute stay hidden')
    || text.includes('Inherit font styles in all browsers')
    || text.includes('Add the correct height in Firefox')
    || text.includes('Remove the default font size and weight for headings')
    || text.includes('Reset links to optimize for opt-in styling')
    || text.includes('Add the correct font weight in Edge and Safari')
    || text.includes('Use the user\'s configured `mono` font-family')
    || text.includes('Add the correct font size in all browsers')
    || text.includes('Prevent `sub` and `sup` elements from affecting the line height')
    || text.includes('Remove text indentation from table contents')
    || text.includes('Use the modern Firefox focus style')
    || text.includes('Add the correct vertical alignment')
    || text.includes('Add the correct display')
    || text.includes('Make lists unstyled by default')
    || text.includes('Make replaced elements `display: block` by default')
    || text.includes('Constrain images and videos to the parent width')
    || text.includes('Restore default font weight')
    || text.includes('Restore indentation')
    || text.includes('Restore space after button')
    || text.includes('Prevent resizing textareas horizontally')
    || text.includes('Remove the inner padding in Chrome and Safari')
    || text.includes('Ensure date/time inputs have the same height')
    || text.includes('Prevent height from changing on date/time inputs')
    || text.includes('Remove excess padding from pseudo-elements')
    || text.includes('Center dropdown marker shown on inputs')
    || text.includes('Remove the additional `:invalid` styles')
    || text.includes('Correct the inability to style the border radius')
    || text.includes('Correct the cursor style of increment and decrement buttons')
}

function isTailwindGeneratedThemeRule(selector: string, node: { nodes?: any[] | undefined }) {
  if (!/(?:^|,)\s*(?::host|page|\.tw-root|wx-root-portal-content)\b/.test(selector)) {
    return false
  }
  return node.nodes?.some(child => child.type === 'decl' && /^--(?:color|spacing|text|font|default|radius|tw-)/.test(child.prop)) ?? false
}

function isTailwindGeneratedPreflightRule(selector: string, node: { nodes?: any[] | undefined }) {
  if (
    selector === 'view,text,::after,::before'
    || selector === 'view, text, ::after, ::before'
    || selector === '*'
    || selector === '::after'
    || selector === '::before'
    || selector === '::backdrop'
    || selector === ':host'
    || selector === '[hidden]:not([hidden="until-found"])'
    || selector === '[hidden]:not([hidden=\'until-found\'])'
    || selector === 'button,input[type="button"],input[type="reset"],input[type="submit"]'
    || selector === 'button, input[type="button"], input[type="reset"], input[type="submit"]'
    || selector === 'button,input[type=\'button\'],input[type=\'reset\'],input[type=\'submit\']'
    || selector === 'button, input[type=\'button\'], input[type=\'reset\'], input[type=\'submit\']'
  ) {
    return true
  }
  if (selector === 'abbr[title]') {
    return node.nodes?.some(child => child.type === 'decl' && child.prop === 'text-decoration') ?? false
  }
  if (selector === ':host') {
    return node.nodes?.some(child => child.type === 'decl' && child.value?.includes('--theme(')) ?? false
  }
  return false
}

export function removeTailwindV4GeneratedUserCssArtifacts(source: string) {
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkComments((comment) => {
      if (!isTailwindGeneratedPreflightComment(comment.text)) {
        return
      }
      comment.remove()
      changed = true
    })
    root.walkRules((rule) => {
      const selector = rule.selector.replace(/\s+/g, ' ').trim()
      if (
        isTailwindGeneratedThemeRule(selector, rule)
        || isTailwindGeneratedPreflightRule(selector, rule)
      ) {
        rule.remove()
        changed = true
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
        changed = true
      }
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

function removeTailwindSourceMediaBlocks(source: string) {
  let next = source
  let changed = false
  const sourceMediaRE = /@media\s+source\([^)]*\)\s*\{/g
  for (;;) {
    sourceMediaRE.lastIndex = 0
    const match = sourceMediaRE.exec(next)
    if (!match) {
      break
    }
    const blockStart = next.indexOf('{', match.index)
    if (blockStart === -1) {
      break
    }
    let depth = 0
    let blockEnd = -1
    for (let index = blockStart; index < next.length; index++) {
      const char = next[index]
      if (char === '{') {
        depth++
        continue
      }
      if (char !== '}') {
        continue
      }
      depth--
      if (depth === 0) {
        blockEnd = index
        break
      }
    }
    if (blockEnd === -1) {
      break
    }
    next = `${next.slice(0, match.index)}${next.slice(blockEnd + 1)}`
    changed = true
  }
  for (;;) {
    const atRuleStart = findTailwindSourceWrapperBlockStart(next)
    if (atRuleStart === -1) {
      break
    }
    next = removeBalancedAtRuleBlock(next, atRuleStart)
    changed = true
  }
  return changed ? next : source
}

function terminateTailwindSourceAtRulesBeforeNextDirective(source: string) {
  if (!source.includes('@source')) {
    return source
  }
  let next = ''
  let searchIndex = 0
  for (;;) {
    const atRuleStart = source.indexOf('@source', searchIndex)
    if (atRuleStart === -1) {
      next += source.slice(searchIndex)
      break
    }
    const nextChar = source[atRuleStart + '@source'.length]
    if (nextChar && /[\w-]/.test(nextChar)) {
      next += source.slice(searchIndex, atRuleStart + '@source'.length)
      searchIndex = atRuleStart + '@source'.length
      continue
    }
    next += source.slice(searchIndex, atRuleStart)
    let quote: string | undefined
    let parenDepth = 0
    let terminated = false
    let index = atRuleStart + '@source'.length
    for (; index < source.length; index++) {
      const char = source[index]
      if (quote) {
        if (char === '\\') {
          index++
          continue
        }
        if (char === quote) {
          quote = undefined
        }
        continue
      }
      if (char === '"' || char === '\'') {
        quote = char
        continue
      }
      if (char === '(') {
        parenDepth++
        continue
      }
      if (char === ')' && parenDepth > 0) {
        parenDepth--
        continue
      }
      if (parenDepth > 0) {
        continue
      }
      if (char === ';' || char === '{') {
        terminated = true
        index++
        break
      }
      if (
        char === '@'
        && /^(?:config|custom-variant|plugin|source|theme|utility|variant)\b/.test(source.slice(index + 1))
      ) {
        break
      }
    }
    const segment = source.slice(atRuleStart, index)
    const trimmedSegment = segment.trimEnd()
    next += terminated || trimmedSegment.endsWith(';') || trimmedSegment.endsWith('{')
      ? segment
      : `${trimmedSegment};${segment.slice(trimmedSegment.length)}`
    searchIndex = index
  }
  return next
}

function findTailwindSourceWrapperBlockStart(source: string) {
  let searchIndex = 0
  for (;;) {
    const atRuleStart = source.indexOf('@source', searchIndex)
    if (atRuleStart === -1) {
      return -1
    }
    const nextChar = source[atRuleStart + '@source'.length]
    if (nextChar && /[\w-]/.test(nextChar)) {
      searchIndex = atRuleStart + '@source'.length
      continue
    }
    let quote: string | undefined
    let parenDepth = 0
    for (let index = atRuleStart + '@source'.length; index < source.length; index++) {
      const char = source[index]
      if (quote) {
        if (char === '\\') {
          index++
          continue
        }
        if (char === quote) {
          quote = undefined
        }
        continue
      }
      if (char === '"' || char === '\'') {
        quote = char
        continue
      }
      if (char === '(') {
        parenDepth++
        continue
      }
      if (char === ')' && parenDepth > 0) {
        parenDepth--
        continue
      }
      if (parenDepth > 0) {
        continue
      }
      if (char === ';') {
        searchIndex = index + 1
        break
      }
      if (char === '{') {
        return atRuleStart
      }
    }
    if (searchIndex <= atRuleStart) {
      return -1
    }
  }
}

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
      if (rule.name === 'media' && /^source\(/.test(rule.params.trim())) {
        rule.remove()
        changed = true
        return
      }
      if (!TAILWIND_V4_GENERATOR_AT_RULES.has(rule.name)) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return removeTailwindV4GeneratorAtRulesFallback(source)
  }
}

export function isCommentOnlyCss(source: string) {
  try {
    const root = postcss.parse(source)
    return root.nodes.length > 0 && root.nodes.every(node => node.type === 'comment')
  }
  catch {
    return false
  }
}

export function removeMiniProgramHoverSelectors(source: string, enabled: boolean | undefined = true) {
  if (!enabled || !source.includes(':hover')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkRules((rule) => {
      const selectors = rule.selectors ?? [rule.selector]
      const keptSelectors = selectors.filter(selector => !selector.includes(':hover'))
      if (keptSelectors.length === selectors.length) {
        return
      }
      changed = true
      if (keptSelectors.length === 0) {
        rule.remove()
        return
      }
      rule.selectors = keptSelectors
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

function removeProcessedMiniProgramUnsupportedCss(
  source: string,
  options: Partial<IStyleHandlerOptions>,
) {
  return removeMiniProgramHoverSelectors(
    removeUnsupportedMiniProgramAtRules(source),
    options.cssRemoveHoverPseudoClass,
  )
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
  return terminateTailwindSourceAtRulesBeforeNextDirective(removeTailwindSourceMediaBlocks(source))
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
  _majorVersion: number | undefined,
  target: string,
  source: string,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
  },
) {
  return target === 'weapp'
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
    processed?: boolean | undefined
  },
) {
  if (source.trim().length === 0) {
    return ''
  }
  if (options.processed) {
    const cleanedSource = options.generatorTarget === 'weapp'
      ? removeTailwindV4GeneratedUserCssArtifacts(
          removeProcessedMiniProgramUnsupportedCss(source, {
            ...options.generatorStyleOptions,
            ...options.cssUserHandlerOptions,
          }),
        )
      : source
    return stripUnmatchedTailwindSourceMediaCloseFragments(
      stripTailwindSourceMediaFragments(
        removeTailwindV4GeneratorAtRules(cleanedSource),
      ),
    )
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
      stripTailwindSourceMediaFragments(
        options.generatorTarget === 'weapp'
          ? removeTailwindV4GeneratedUserCssArtifacts(removeUnsupportedMiniProgramAtRules(unwrapMiniProgramCascadeLayers(cleanedSource)))
          : cleanedSource,
      ),
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
  return removeTailwindV4GeneratedUserCssArtifacts(removeUnsupportedMiniProgramAtRules(css))
}
