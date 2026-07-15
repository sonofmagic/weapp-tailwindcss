import type { OutputBundle } from 'rollup'
import type { CssAssetMarkerMatcher, CssAssetResultRecorder } from './markers-imports'
import { postcss } from '@weapp-tailwindcss/postcss'
import { parseBundlerGeneratedCssMarkerBlocks, stripBundlerGeneratedCssMarkers } from '../../shared/generated-css-marker'
import { isSubpackageOutputFile } from '../generate-bundle/subpackages'
import { collectRootStyleBundleCssSources, getAssetFile, hasNonCommentCss, isCssOutputFile, isMatchingGeneratedCssMarkerFile, normalizeMarkerOutputFile, readAssetSource } from './markers-imports'
import { isMiniProgramStyleOutputFile, isRootStyleOutputFile } from './style-files'

const VUE_SCOPED_ATTR_RE = /\[data-v-[^\]]+\]/gi
const VUE_SCOPED_CLASS_RE = /\.data-v-[\w-]+/gi

function hasVueScopedAttr(value: string) {
  VUE_SCOPED_ATTR_RE.lastIndex = 0
  VUE_SCOPED_CLASS_RE.lastIndex = 0
  const matched = VUE_SCOPED_ATTR_RE.test(value) || VUE_SCOPED_CLASS_RE.test(value)
  VUE_SCOPED_ATTR_RE.lastIndex = 0
  VUE_SCOPED_CLASS_RE.lastIndex = 0
  return matched
}

export function normalizeCssSignatureValue(value: string) {
  return value
    .replace(VUE_SCOPED_ATTR_RE, '')
    .replace(VUE_SCOPED_CLASS_RE, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim()
}

function createDeclarationSignature(rule: postcss.Rule) {
  return createDeclarationKeys(rule).sort().join(';')
}

function createRuleCoverageKey(selector: string, declarations: string) {
  return `${normalizeCssSignatureValue(selector)}\0${declarations}`
}

function createDeclarationKeys(rule: postcss.Rule) {
  return (rule.nodes ?? [])
    .filter((node): node is postcss.Declaration => node.type === 'decl')
    .map(node => `${node.prop}:${normalizeCssSignatureValue(node.value)}${node.important ? '!important' : ''}`)
}

function createAtRuleCoverageKey(atRule: postcss.AtRule) {
  return `${atRule.name}\0${normalizeCssSignatureValue(atRule.params)}\0${normalizeCssSignatureValue(atRule.toString())}`
}

function hasClassSelector(selector: string) {
  return /(?:^|[^\\])\.[_a-z\u00A0-\uFFFF-]/i.test(normalizeCssSignatureValue(selector))
}

function isLikelyTailwindGlobalSelector(selector: string) {
  const normalized = normalizeCssSignatureValue(selector)
  return normalized === '*'
    || normalized.startsWith('::')
    || normalized.startsWith(':root')
    || normalized.startsWith(':host')
    || /^(?:html|body|hr|abbr|h1|h2|h3|h4|h5|h6|a|b|strong|code|kbd|samp|small|sub|sup|table|button|input|select|optgroup|textarea|summary|blockquote|dl|dd|fieldset|legend|ol|ul|menu|dialog|progress|video|audio|canvas|embed|iframe|img|object|svg|details|template|[uo]ni-progress)(?:$|[:,[\s>+~.#])/.test(normalized)
}

function isLikelyTailwindGlobalRule(rule: postcss.Rule) {
  return (rule.selectors ?? [rule.selector]).every(selector =>
    !hasClassSelector(selector) && isLikelyTailwindGlobalSelector(selector),
  )
}

function isLikelyTailwindPropertyAtRule(atRule: postcss.AtRule) {
  return atRule.name.toLowerCase() === 'property'
    && normalizeCssSignatureValue(atRule.params).startsWith('--tw-')
}

const MINI_PROGRAM_PREFLIGHT_SELECTORS = new Set(['view', 'text', '::after', '::before'])
const MINI_PROGRAM_PREFLIGHT_DECLARATIONS = new Set(['box-sizing', 'margin', 'padding', 'border'])

function isMiniProgramTailwindPreflightDeclaration(decl: postcss.Declaration) {
  return decl.prop.startsWith('--tw-') || MINI_PROGRAM_PREFLIGHT_DECLARATIONS.has(decl.prop)
}

function isUnscopedMiniProgramTailwindPreflightRule(rule: postcss.Rule) {
  const selectors = rule.selectors ?? [rule.selector]
  if (
    selectors.length === 0
    || !selectors.every((selector) => {
      const normalized = normalizeCssSignatureValue(selector)
      return !hasVueScopedAttr(selector) && MINI_PROGRAM_PREFLIGHT_SELECTORS.has(normalized)
    })
  ) {
    return false
  }
  const declarations = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl') ?? []
  return declarations.length > 0 && declarations.every(isMiniProgramTailwindPreflightDeclaration)
}

function isScopedMiniProgramTailwindContentInitRule(rule: postcss.Rule) {
  const selectors = rule.selectors ?? [rule.selector]
  if (
    selectors.length === 0
    || !selectors.every((selector) => {
      const normalized = normalizeCssSignatureValue(selector)
      return hasVueScopedAttr(selector) && MINI_PROGRAM_PREFLIGHT_SELECTORS.has(normalized)
    })
  ) {
    return false
  }
  const declarations = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl') ?? []
  return declarations.length > 0 && declarations.every(decl => decl.prop === '--tw-content')
}

function hasUnscopedMiniProgramTailwindPreflightRule(css: string) {
  return /(?:^|[{}])\s*view\s*,\s*text\s*,\s*::after\s*,\s*::before\s*\{/.test(css)
}

function hasScopedMiniProgramTailwindContentInitRule(css: string) {
  return /(?:^|[{}])[^{}]*\.data-v-[\w-][^{}]*\{\s*--tw-content\s*:/.test(css)
}

export function collectRootScopedComparableCssCoverage(cssSources: string[]) {
  const rules = new Set<string>()
  const atRules = new Set<string>()
  const declarationsBySelector = new Map<string, Set<string>>()
  const normalizedRuleCss = new Set<string>()
  for (const source of cssSources) {
    try {
      const root = postcss.parse(source)
      root.walkRules((rule) => {
        normalizedRuleCss.add(normalizeCssSignatureValue(rule.toString()))
        const declarations = createDeclarationSignature(rule)
        if (declarations.length === 0) {
          return
        }
        for (const selector of rule.selectors ?? [rule.selector]) {
          const normalizedSelector = normalizeCssSignatureValue(selector)
          rules.add(`${normalizedSelector}\0${declarations}`)
          const selectorDeclarations = declarationsBySelector.get(normalizedSelector) ?? new Set<string>()
          for (const declaration of createDeclarationKeys(rule)) {
            selectorDeclarations.add(declaration)
          }
          declarationsBySelector.set(normalizedSelector, selectorDeclarations)
        }
      })
      root.walkAtRules((atRule) => {
        atRules.add(createAtRuleCoverageKey(atRule))
      })
    }
    catch {
    }
  }
  return { rules, atRules, declarationsBySelector, normalizedRuleCss }
}

export type ComparableCssCoverage = ReturnType<typeof collectRootScopedComparableCssCoverage>

export function prepareImportedCssCoverage(importedCssSources: string[]) {
  const sources = importedCssSources
    .map(source => stripBundlerGeneratedCssMarkers(source).trim())
    .filter(Boolean)
  if (sources.length === 0) {
    return undefined
  }
  return {
    coverage: collectRootScopedComparableCssCoverage(sources),
    sources,
  }
}

export function isRuleCoveredByRootCss(rule: postcss.Rule, coverage: ReturnType<typeof collectRootScopedComparableCssCoverage>) {
  const declarations = createDeclarationSignature(rule)
  if (declarations.length === 0) {
    return false
  }
  const selectors = rule.selectors ?? [rule.selector]
  if (selectors.every(selector => coverage.rules.has(createRuleCoverageKey(selector, declarations)))) {
    return true
  }
  const declarationKeys = createDeclarationKeys(rule)
  return declarationKeys.length > 0
    && selectors.every((selector) => {
      const rootDeclarations = coverage.declarationsBySelector.get(normalizeCssSignatureValue(selector))
      return rootDeclarations != null && declarationKeys.every(declaration => rootDeclarations.has(declaration))
    })
}

function removeScopedCssCoveredByRootStyleSources(css: string, rootSources: string[]) {
  if (!hasVueScopedAttr(css)) {
    return css
  }
  const hasScopedTailwindGeneratedCss = /tailwindcss v\d/i.test(css)
  const hasUnscopedMiniProgramPreflight = hasUnscopedMiniProgramTailwindPreflightRule(css)
  const hasScopedMiniProgramContentInit = hasScopedMiniProgramTailwindContentInitRule(css)
  const coverage = collectRootScopedComparableCssCoverage(rootSources)
  if (coverage.rules.size === 0 && coverage.atRules.size === 0 && !hasScopedTailwindGeneratedCss && !hasUnscopedMiniProgramPreflight && !hasScopedMiniProgramContentInit) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkComments((comment) => {
      if (/tailwindcss v\d/i.test(comment.text)) {
        comment.remove()
        changed = true
      }
    })
    root.walkRules((rule) => {
      if (
        isRuleCoveredByRootCss(rule, coverage)
        || (
          hasScopedTailwindGeneratedCss
          && isLikelyTailwindGlobalRule(rule)
        )
        || isUnscopedMiniProgramTailwindPreflightRule(rule)
        || isScopedMiniProgramTailwindContentInitRule(rule)
      ) {
        rule.remove()
        changed = true
      }
    })
    root.walkAtRules((atRule) => {
      if (
        coverage.atRules.has(createAtRuleCoverageKey(atRule))
        || (
          hasScopedTailwindGeneratedCss
          && isLikelyTailwindPropertyAtRule(atRule)
        )
      ) {
        atRule.remove()
        changed = true
        return
      }
      if (atRule.nodes !== undefined && atRule.nodes.length === 0) {
        atRule.remove()
        changed = true
      }
    })
    return changed ? removeDanglingCssSourceTraceComments(root.toString()).trim() : css
  }
  catch {
    return css
  }
}

export function removeScopedTailwindPreflightCss(css: string) {
  return removeScopedCssCoveredByRootStyleSources(css, [])
}

export function collectSingleViteGeneratedCssMarkerFile(rawSource: string) {
  const blocks = parseBundlerGeneratedCssMarkerBlocks(rawSource)
    .filter(block => block.bundler === 'vite')
  if (blocks.length !== 1) {
    return undefined
  }
  const file = blocks[0]?.file
  return typeof file === 'string' && file.length > 0 ? file : undefined
}

export function shouldFilterRootGeneratedCssMarkerForScopedAsset(
  targetFile: string,
  markerFile: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const resolvedTargetFile = normalizeMarkerOutputFile(targetFile, resolveViteProcessedCssOutputFile)
  const resolvedMarkerFile = normalizeMarkerOutputFile(markerFile, resolveViteProcessedCssOutputFile)
  if (
    !isRootStyleOutputFile(resolvedMarkerFile)
    || isRootStyleOutputFile(resolvedTargetFile)
  ) {
    return false
  }
  return !isMatchingGeneratedCssMarkerFile(targetFile, markerFile, resolveViteProcessedCssOutputFile)
}

export function removeCssCoveredByRootStyleBundleSources(
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  const rootSources = collectRootStyleBundleCssSources(bundle, file)
  if (css.trim().length === 0) {
    return css
  }
  const hasScopedCss = hasVueScopedAttr(css)
  const hasScopedTailwindGeneratedCss = hasScopedCss && /tailwindcss v\d/i.test(css)
  const hasUnscopedMiniProgramPreflight = hasScopedCss && hasUnscopedMiniProgramTailwindPreflightRule(css)
  const hasScopedMiniProgramContentInit = hasScopedCss && hasScopedMiniProgramTailwindContentInitRule(css)
  if (
    rootSources.length === 0
    && !hasScopedTailwindGeneratedCss
    && !hasUnscopedMiniProgramPreflight
    && !hasScopedMiniProgramContentInit
  ) {
    return css
  }
  const coverage = collectRootScopedComparableCssCoverage(rootSources)
  let nextCss = css
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkRules((rule) => {
      if (
        coverage.normalizedRuleCss.has(normalizeCssSignatureValue(rule.toString()))
        || (
          hasScopedCss
          && (
            isRuleCoveredByRootCss(rule, coverage)
            || (hasScopedTailwindGeneratedCss && isLikelyTailwindGlobalRule(rule))
            || isUnscopedMiniProgramTailwindPreflightRule(rule)
            || isScopedMiniProgramTailwindContentInitRule(rule)
          )
        )
      ) {
        rule.remove()
        changed = true
      }
    })
    if (hasScopedCss) {
      root.walkAtRules((atRule) => {
        if (
          coverage.atRules.has(createAtRuleCoverageKey(atRule))
          || (hasScopedTailwindGeneratedCss && isLikelyTailwindPropertyAtRule(atRule))
        ) {
          atRule.remove()
          changed = true
          return
        }
        if (atRule.nodes !== undefined && atRule.nodes.length === 0) {
          atRule.remove()
          changed = true
        }
      })
    }
    root.walkComments((comment) => {
      if (hasScopedCss && /tailwindcss v\d/i.test(comment.text)) {
        comment.remove()
        changed = true
        return
      }
      if (!comment.text.trim().startsWith('tokens:')) {
        return
      }
      const next = comment.next()
      if (next?.type === 'rule' || next?.type === 'atrule') {
        return
      }
      comment.remove()
      changed = true
    })
    if (changed) {
      nextCss = root.toString().trim()
    }
  }
  catch {
  }
  return hasNonCommentCss(nextCss) ? nextCss : ''
}

function removeDanglingCssSourceTraceComments(css: string) {
  if (!css.includes('/* tokens:')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.each((node) => {
      if (node.type !== 'comment' || !node.text.trim().startsWith('tokens:')) {
        return
      }
      const next = node.next()
      if (next?.type === 'rule' || next?.type === 'atrule') {
        return
      }
      node.remove()
      changed = true
    })
    return changed ? root.toString().trim() : css
  }
  catch {
    return css
  }
}

export function removeCssCoveredByRootStyleAssets(
  bundle: OutputBundle,
  options: {
    cssMatcher: (file: string) => boolean
    debug?: ((format: string, ...args: unknown[]) => void) | undefined
    includeTailwindGeneratedCssAssets?: boolean | undefined
    isViteProcessedCssAsset?: CssAssetMarkerMatcher | undefined
    onUpdate?: ((file: string, original: string, generated: string) => void) | undefined
    recordCssAssetResult?: CssAssetResultRecorder | undefined
    subpackageRoots?: Set<string> | undefined
  },
) {
  let updated = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    const rawSource = readAssetSource(output)
    const hasScopedCss = hasVueScopedAttr(rawSource)
    const hasTailwindGeneratedCss = /tailwindcss v\d/i.test(rawSource)
    const shouldIncludeTailwindGeneratedCssAsset = options.includeTailwindGeneratedCssAssets === true
      && hasTailwindGeneratedCss
      && isCssOutputFile(file)
      && !isMiniProgramStyleOutputFile(file)
    if (
      !(options.cssMatcher(file) || (hasScopedCss && isCssOutputFile(file)) || shouldIncludeTailwindGeneratedCssAsset)
      || isRootStyleOutputFile(file)
      || (
        options.isViteProcessedCssAsset?.(output, file) === true
        && !hasScopedCss
        && !shouldIncludeTailwindGeneratedCssAsset
      )
      || (
        options.subpackageRoots != null
        && isSubpackageOutputFile(file, options.subpackageRoots)
      )
    ) {
      continue
    }
    const nextCss = removeCssCoveredByRootStyleBundleSources(bundle, file, rawSource)
    if (nextCss === rawSource) {
      continue
    }
    output.source = nextCss
    options.recordCssAssetResult?.(file, nextCss)
    options.onUpdate?.(file, rawSource, nextCss)
    options.debug?.('remove root-covered css rules from scoped asset: %s bytes=%d', file, nextCss.length)
    updated++
  }
  return updated
}
