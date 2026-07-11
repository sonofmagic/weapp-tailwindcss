import type { TailwindV4CssSource } from '../../../shared/generator-css/source-resolver/types'
import type { createEscapeFragments } from '../../../vite/incremental-runtime-class-set/escaped-candidates'
import type { SourceCandidateStore } from '../../../vite/source-candidates'
import type { SetupWebpackV5ProcessAssetsHookOptions, WebpackSourceLike } from './helpers'
import type { WebpackSourceCandidateScanMemoryStats } from './source-candidate-cache'
import type { InternalUserDefinedOptions, TailwindcssRuntimeLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { MappingChars2String } from '@weapp-core/escape'
import { filterExistingCssRules, postcss, removeUnsupportedCascadeLayers } from '@weapp-tailwindcss/postcss'
import { resolveStyleOptionsFromContext } from '@/context/style-options'
import { getDefaultCssPreflight } from '@/defaults'
import { getTailwindV4IncrementalGenerateCacheStats } from '@/tailwindcss/v4-engine'
import { finalizeMiniProgramCss, pruneMiniProgramGeneratedCss, stripMiniProgramCssSpecificityPlaceholders } from '../../../shared/css-cleanup'
import { createCssTokenSourceMap, isCssSourceTraceEnabled } from '../../../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../../../shared/generated-css-marker'
import { hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, hasTailwindSourceDirectives } from '../../../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, parseImportRequest, removeTailwindSourceDirectives } from '../../../shared/generator-css/directives'
import { createCssSourceOrderAppend, hasMiniProgramTailwindV4PreflightReset } from '../../../shared/generator-css/generation-helpers'
import { removeMiniProgramHoverSelectors, removeTailwindV4GeneratedUserCssArtifacts, removeTailwindV4GeneratorAtRules, stripTailwindSourceMediaFragments, stripUnmatchedTailwindSourceMediaCloseFragments } from '../../../shared/generator-css/user-css'
import { collectStrictEscapedRuntimeCandidates } from '../../../vite/incremental-runtime-class-set/escaped-candidates'
import { isCssLikeModuleResource, stripResourceQuery } from '../shared'

export interface WebpackCssHandlerOptions {
  isMainChunk: boolean
  postcssOptions: { options: { from: string } }
  majorVersion?: 4 | undefined
  sourceOptions?: {
    cssSources?: TailwindV4CssSource[] | undefined
    outputRoot?: string | undefined
    sourceCss?: string | undefined
    sourceFile?: string | undefined
  } | undefined
}

const WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX = 128

function resolveConfiguredWebpackCssPreflight(
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  styleOptions: ReturnType<typeof resolveStyleOptionsFromContext>,
) {
  return styleOptions.cssPreflight ?? compilerOptions.cssPreflight ?? getDefaultCssPreflight()
}

function resolveExistingWebpackCssPreflight(
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  styleOptions: ReturnType<typeof resolveStyleOptionsFromContext>,
  source: string,
) {
  return hasMiniProgramPreflightSelector(source)
    ? resolveConfiguredWebpackCssPreflight(compilerOptions, styleOptions)
    : undefined
}

function removeMiniProgramPreflightSelectorRule(source: string) {
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkRules((rule) => {
      const selectors = new Set((rule.selectors ?? [rule.selector])
        .map(selector => selector.trim().replace(/^:before$/, '::before').replace(/^:after$/, '::after')))
      if (
        selectors.has('view')
        && selectors.has('text')
        && selectors.has('::before')
        && selectors.has('::after')
      ) {
        rule.remove()
        changed = true
      }
    })
    return changed ? root.toString() : source
  }
  catch {
    return source.replace(/(?:^|[}\s])\s*view\s*,\s*text\s*,\s*::after\s*,\s*::before\s*\{[^}]*\}/g, '')
  }
}

function dedupeMiniProgramPreflightSelectorRules(source: string) {
  try {
    const root = postcss.parse(source)
    let firstRule: postcss.Rule | undefined
    let changed = false
    root.walkRules((rule) => {
      const selectors = new Set((rule.selectors ?? [rule.selector])
        .map(selector => selector.trim().replace(/^:before$/, '::before').replace(/^:after$/, '::after')))
      if (
        !selectors.has('view')
        || !selectors.has('text')
        || !selectors.has('::before')
        || !selectors.has('::after')
      ) {
        return
      }
      if (!firstRule) {
        firstRule = rule
        return
      }
      const existingProps = new Set<string>()
      firstRule.walkDecls((decl) => {
        existingProps.add(decl.prop)
      })
      rule.walkDecls((decl) => {
        if (!existingProps.has(decl.prop)) {
          firstRule?.append(decl.clone())
          existingProps.add(decl.prop)
        }
      })
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

function hasMiniProgramPreflightSelector(source: string) {
  try {
    let found = false
    postcss.parse(source).walkRules((rule) => {
      const selectors = new Set((rule.selectors ?? [rule.selector])
        .map(selector => selector.trim().replace(/^:before$/, '::before').replace(/^:after$/, '::after')))
      if (
        selectors.has('view')
        && selectors.has('text')
        && selectors.has('::before')
        && selectors.has('::after')
      ) {
        found = true
        return false
      }
    })
    return found
  }
  catch {
    return /(?:^|[},])\s*view\s*,\s*text\s*,\s*::after\s*,\s*::before\s*\{/.test(source)
  }
}

function ensureWebpackMiniProgramTwContentInit(source: string) {
  if (!source.includes('var(--tw-content)')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkRules((rule) => {
      const selectors = new Set((rule.selectors ?? [rule.selector])
        .map(selector => selector.trim().replace(/^:before$/, '::before').replace(/^:after$/, '::after')))
      if (
        !selectors.has('view')
        || !selectors.has('text')
        || !selectors.has('::before')
        || !selectors.has('::after')
      ) {
        return
      }
      let hasContentInit = false
      rule.walkDecls('--tw-content', () => {
        hasContentInit = true
      })
      if (!hasContentInit) {
        rule.append(postcss.decl({ prop: '--tw-content', value: '\'\'' }))
        changed = true
      }
      return false
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export function removeTailwindV4StandaloneHostPreflightRule(source: string) {
  if (!source.includes('--theme(')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkRules((rule) => {
      if (rule.selector.trim() !== ':host') {
        return
      }
      if (!rule.nodes?.some(node => node.type === 'decl' && node.value?.includes('--theme('))) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export interface WebpackSourceCandidateCache {
  getSourceCandidatesForEntries: SourceCandidateStore['valuesForEntries']
  signatureHash: string
  tokenSources: ReturnType<SourceCandidateStore['sourcesForEntries']>
}

export function isRuntimeTransformCandidate(candidate: string) {
  return candidate.length > 0
    && !candidate.includes('=')
    && !candidate.includes('<')
    && !candidate.includes('>')
    && !candidate.includes('${')
}

export function collectRuntimeTokenSignatureParts(source: string) {
  return source.match(/[\w-]+_[A-Z][\w-]*/gi) ?? []
}

export function hasMissingRuntimeCandidates(
  classSet: ReadonlySet<string> | undefined,
  candidates: ReadonlySet<string> | undefined,
) {
  if (!classSet || !candidates?.size) {
    return false
  }
  for (const candidate of candidates) {
    if (isRuntimeTransformCandidate(candidate) && !classSet.has(candidate)) {
      return true
    }
  }
  return false
}

export function hasStaleRuntimeCandidates(
  classSet: ReadonlySet<string> | undefined,
  candidates: ReadonlySet<string> | undefined,
) {
  if (!classSet || !candidates) {
    return false
  }
  for (const candidate of classSet) {
    if (isRuntimeTransformCandidate(candidate) && !candidates.has(candidate)) {
      return true
    }
  }
  return false
}

export function resolveGeneratedCssRuntimeCandidates(
  source: string,
  fallbackClassSet?: ReadonlySet<string> | undefined,
) {
  const classSet = collectGeneratedCssRuntimeCandidates(source)
  if (classSet.size > 0 || fallbackClassSet === undefined) {
    return classSet
  }
  return fallbackClassSet
}

export function getRuntimeClassSetSync(tailwindRuntime: TailwindcssRuntimeLike) {
  if (typeof tailwindRuntime.getClassSetSync !== 'function') {
    return new Set<string>()
  }
  try {
    return new Set(tailwindRuntime.getClassSetSync() ?? [])
  }
  catch {
    return new Set<string>()
  }
}

export function toMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024)
}

export function pruneMapToMaxSize<Key, Value>(map: Map<Key, Value>, maxSize: number) {
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value
    if (oldestKey === undefined) {
      break
    }
    map.delete(oldestKey)
  }
}

export function stripTrailingLineWhitespace(source: string) {
  return source.replace(/[ \t]+$/gm, '')
}

export function pruneWebpackCssHandlerOptionCaches(
  cssHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>,
  cssUserHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>,
  activeCssFiles: Set<string>,
) {
  const activeSuffixes = [...activeCssFiles].map(file => `:${file}`)
  for (const key of cssHandlerOptionsCache.keys()) {
    if (!activeSuffixes.some(suffix => key.endsWith(suffix))) {
      cssHandlerOptionsCache.delete(key)
    }
  }
  for (const key of cssUserHandlerOptionsCache.keys()) {
    if (!activeSuffixes.some(suffix => key.endsWith(suffix))) {
      cssUserHandlerOptionsCache.delete(key)
    }
  }
  pruneMapToMaxSize(cssHandlerOptionsCache, WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX)
  pruneMapToMaxSize(cssUserHandlerOptionsCache, WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX)
}

export function resolveWebpackGeneratorRawSource(
  rawSource: string,
  cssHandlerOptions: WebpackCssHandlerOptions,
) {
  const sourceCss = cssHandlerOptions.sourceOptions?.sourceCss
  if (
    sourceCss
    && (
      hasTailwindRootDirectives(sourceCss, { importFallback: true })
      || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
      || hasTailwindApplyDirective(sourceCss)
      || hasTailwindGeneratedCss(sourceCss)
      || hasTailwindGeneratedCssMarkers(sourceCss)
    )
  ) {
    return sourceCss
  }
  return rawSource
}

export function shouldConsumeWebpackLoaderGeneratedCss(options: {
  hasBundlerGeneratedCssMarker: boolean
  loaderGeneratedClassSet?: Set<string> | undefined
  sourceCandidates?: Set<string> | undefined
  shouldRegenerateExplicitTailwindV4CssSource: boolean
  watchMode?: boolean | undefined
}) {
  if (!options.shouldRegenerateExplicitTailwindV4CssSource) {
    return true
  }
  if (
    options.watchMode === true
    && options.loaderGeneratedClassSet
    && options.sourceCandidates
    && (
      hasMissingRuntimeCandidates(options.loaderGeneratedClassSet, options.sourceCandidates)
      || hasStaleRuntimeCandidates(options.loaderGeneratedClassSet, options.sourceCandidates)
    )
  ) {
    return false
  }
  return options.hasBundlerGeneratedCssMarker
}

export interface WebpackGeneratorUserCssSource {
  css: string
  processed: boolean
}

export function hasUsableWebpackGeneratorCssSources(
  cssSources: TailwindV4CssSource[] | undefined,
): cssSources is TailwindV4CssSource[] {
  return Array.isArray(cssSources)
    && cssSources.some(source => typeof source?.css === 'string' && source.css.length > 0)
}

export function normalizeWebpackGeneratorCssSources(cssSources: TailwindV4CssSource[] | undefined) {
  if (!Array.isArray(cssSources)) {
    return undefined
  }
  const normalized = cssSources.filter(source => typeof source?.css === 'string' && source.css.length > 0)
  return normalized.length > 0 ? normalized : undefined
}

export function scopeWebpackGeneratorOptionsToCssSource(
  compilerOptions: InternalUserDefinedOptions,
  sourceFile: string | undefined,
  options: { disableUnmatchedCssEntries?: boolean | undefined } = {},
) {
  const withoutCssEntries = () => ({
    ...compilerOptions,
    ...(compilerOptions.cssEntries?.length ? { cssEntries: [] } : {}),
    tailwindcss: {
      ...compilerOptions.tailwindcss,
      v4: {
        ...compilerOptions.tailwindcss?.v4,
        ...(compilerOptions.tailwindcss?.v4?.cssEntries?.length || compilerOptions.cssEntries?.length
          ? { cssEntries: [] }
          : {}),
      },
    },
  })
  if (!sourceFile) {
    if (options.disableUnmatchedCssEntries !== true) {
      return compilerOptions
    }
    if (!compilerOptions.cssEntries?.length && !compilerOptions.tailwindcss?.v4?.cssEntries?.length) {
      return compilerOptions
    }
    return withoutCssEntries()
  }
  const resolvedSourceFile = path.resolve(sourceFile)
  if (options.disableUnmatchedCssEntries === true) {
    const configuredEntries = [
      ...(compilerOptions.cssEntries ?? []),
      ...(compilerOptions.tailwindcss?.v4?.cssEntries ?? []),
    ]
    if (configuredEntries.length > 0 && !configuredEntries.some(entry => path.resolve(entry) === resolvedSourceFile)) {
      return withoutCssEntries()
    }
  }
  const cssEntries = compilerOptions.cssEntries?.filter(entry => path.resolve(entry) === resolvedSourceFile)
  const runtimeCssEntries = compilerOptions.tailwindcss?.v4?.cssEntries?.filter(entry => path.resolve(entry) === resolvedSourceFile)
  const hasScopedCssEntries = Boolean(cssEntries?.length)
  const hasScopedRuntimeCssEntries = Boolean(runtimeCssEntries?.length)
  if (!hasScopedCssEntries && !hasScopedRuntimeCssEntries) {
    return compilerOptions
  }
  const scoped = {
    ...compilerOptions,
    ...(hasScopedCssEntries ? { cssEntries } : {}),
    tailwindcss: {
      ...compilerOptions.tailwindcss,
      v4: {
        ...compilerOptions.tailwindcss?.v4,
        ...(hasScopedRuntimeCssEntries
          ? { cssEntries: runtimeCssEntries }
          : hasScopedCssEntries
            ? { cssEntries }
            : {}),
      },
    },
  }
  return scoped
}

export function hasProcessedCssAssetUrl(css: string) {
  return /url\(\s*["']?data:/i.test(css)
}

export function shouldUseWebpackAssetAsGeneratorUserCss(
  rawSource: string,
  generatorRawSource: string,
  options: { processed?: boolean | undefined } = {},
) {
  const rawMarkers = collectWebpackAssetUserCssMarkers(rawSource)
  return rawSource !== generatorRawSource
    && (options.processed === true || !rawSource.includes('data:'))
    && !hasTailwindRootDirectives(rawSource, { importFallback: true })
    && !hasTailwindSourceDirectives(rawSource, { importFallback: true })
    && !hasTailwindApplyDirective(rawSource)
    && rawMarkers.size > 0
    && !isOnlyWebpackTailwindGeneratedPreflightCss(rawSource)
    && (
      !hasTailwindGeneratedCssMarkers(rawSource)
      || hasAdditionalWebpackAssetUserCssMarkers(rawSource, generatorRawSource)
    )
}

export function collectWebpackAssetUserCssMarkers(source: string) {
  const markers = new Set<string>()
  for (const match of source.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
    markers.add(`class:${match[1]}`)
  }
  for (const match of source.matchAll(/@(?:-[\w-]+-)?keyframes\s+((?:\\.|[-\w\u00A0-\uFFFF])+)/gi)) {
    markers.add(`keyframes:${match[1]}`)
  }
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors) {
        if (!/(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i.test(selector)) {
          markers.add(`selector:${selector.trim().replace(/\s+/g, ' ')}`)
        }
      }
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          markers.add(`custom-property:${decl.prop}`)
        }
      })
    })
    root.walkAtRules('font-face', (rule) => {
      rule.walkDecls('font-family', (decl) => {
        markers.add(`font-face:${decl.value.trim()}`)
      })
    })
  }
  catch {
    // 保留原始生成 CSS，继续交给 finalize 处理声明级兼容降级。
  }
  return markers
}

function hasWebpackClassSelector(selector: string) {
  return /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i.test(selector)
}

function isWebpackKeyframesRule(rule: postcss.Rule) {
  let parent = rule.parent as postcss.Container | undefined
  while (parent) {
    if (parent.type === 'atrule' && (parent as postcss.AtRule).name.endsWith('keyframes')) {
      return true
    }
    parent = parent.parent as postcss.Container | undefined
  }
  return false
}

export function collectWebpackBareSelectorUserCss(source: string) {
  try {
    const normalizedSource = removeTailwindSourceDirectives(
      stripTailwindSourceMediaFragments(
        removeTailwindV4GeneratorAtRules(source),
      ),
      { importFallback: true },
    )
    const root = postcss.parse(normalizedSource)
    let changed = false
    root.walkAtRules((rule) => {
      if (rule.name === 'import' || rule.name === 'font-face' || rule.name.endsWith('keyframes')) {
        rule.remove()
        changed = true
      }
    })
    root.walkRules((rule) => {
      if (
        isWebpackKeyframesRule(rule)
        || rule.selectors.some(selector => hasWebpackClassSelector(selector))
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
    return changed ? root.toString() : normalizedSource
  }
  catch {
    return ''
  }
}

const WEBPACK_TAILWIND_GENERATED_LAYER_NAMES = new Set(['theme', 'base', 'utilities'])
const WEBPACK_TAILWIND_UTILITY_RULE_MARKER_RE = /(?:^|[^\w-])\.[^,{]{0,512}(?:\\:|\\\[|\\#)/
const WEBPACK_TAILWIND_UTILITY_PREFIX_RE = /^\.(?:-?(?:bg|text|border|ring|shadow|drop-shadow|[pmwhz]|px|py|pt|pr|pb|pl|mx|my|mt|mr|mb|ml|min-w|min-h|max-w|max-h|flex|grid|inline|block|hidden|rounded|opacity|translate|scale|rotate|skew|top|right|bottom|left|inset|gap|font|leading|tracking|underline|container)(?:[\-\\{]|$)|\\\[)/
const WEBPACK_TAILWIND_BANNER_RE = /tailwindcss v4\./
const WEBPACK_TAILWIND_PREFLIGHT_SELECTORS = new Set(['*', ':after', ':before', '::after', '::before', '::backdrop', 'view', 'text'])
const WEBPACK_TAILWIND_PREFLIGHT_PROPS = new Set(['box-sizing', 'border', 'border-width', 'border-style', 'border-color', 'margin', 'padding'])
const WEBPACK_TAILWIND_THEME_TOKEN_RE = /^--(?:tw-|color-|spacing|breakpoint-|container-|text-|font-|tracking-|leading-|radius-|shadow-|inset-shadow-|drop-shadow-|ease-|animate-|blur-|perspective-|aspect-|default-)/

export function parseWebpackCssLayerNames(params: string) {
  return params
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
}

export function removeWebpackTailwindGeneratedAssetCss(source: string) {
  const cleaned = removeTailwindV4GeneratedUserCssArtifacts(source)
  try {
    const root = postcss.parse(cleaned)
    let changed = false
    let removingBannerPrefix = false
    for (const node of [...root.nodes]) {
      if (node.type === 'comment' && WEBPACK_TAILWIND_BANNER_RE.test(node.text)) {
        node.remove()
        changed = true
        removingBannerPrefix = true
        continue
      }
      if (!removingBannerPrefix) {
        continue
      }
      if (isWebpackTailwindGeneratedPrefixNode(node)) {
        node.remove()
        changed = true
        continue
      }
      removingBannerPrefix = false
    }
    root.walkAtRules('layer', (rule) => {
      const names = parseWebpackCssLayerNames(rule.params)
      const hasGeneratedLayerName = names.some(name => WEBPACK_TAILWIND_GENERATED_LAYER_NAMES.has(name))
      const isLayerDeclaration = rule.nodes === undefined
      const shouldRemoveLayer = isLayerDeclaration
        ? hasGeneratedLayerName
        : names.length > 0 && names.every(name => WEBPACK_TAILWIND_GENERATED_LAYER_NAMES.has(name))
      if (shouldRemoveLayer && isLayerDeclaration) {
        rule.remove()
        changed = true
        return
      }
      if (shouldRemoveLayer && !names.includes('utilities')) {
        for (const child of [...rule.nodes ?? []]) {
          if (isWebpackTailwindGeneratedLayerNode(child, names)) {
            child.remove()
            changed = true
          }
        }
        if (rule.nodes?.length === 0) {
          rule.remove()
          changed = true
        }
        return
      }
      if (shouldRemoveLayer) {
        for (const child of [...rule.nodes ?? []]) {
          if (isWebpackTailwindGeneratedLayerNode(child, names)) {
            child.remove()
            changed = true
          }
        }
        if (rule.nodes?.length === 0) {
          rule.remove()
          changed = true
        }
      }
    })
    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && rule.parent.name === 'layer') {
        return
      }
      const selector = rule.selector.trim()
      if (
        WEBPACK_TAILWIND_UTILITY_RULE_MARKER_RE.test(selector)
        || isWebpackTailwindGeneratedPreflightRule(rule)
      ) {
        rule.remove()
        changed = true
      }
    })
    root.walkComments((comment) => {
      if (WEBPACK_TAILWIND_BANNER_RE.test(comment.text)) {
        comment.remove()
        changed = true
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
        changed = true
      }
    })
    return changed ? root.toString() : cleaned
  }
  catch {
    return cleaned
  }
}

function isWebpackTailwindGeneratedPrefixNode(node: postcss.ChildNode): boolean {
  if (node.type === 'rule') {
    return isWebpackTailwindGeneratedRule(node, ['theme', 'base', 'utilities'], true)
  }
  if (node.type !== 'atrule') {
    return false
  }
  const names = node.name === 'layer'
    ? parseWebpackCssLayerNames(node.params)
    : []
  if (
    node.name === 'property'
    && node.params.trim().startsWith('--tw-')
  ) {
    return true
  }
  if (
    names.length > 0
    && names.every(name => WEBPACK_TAILWIND_GENERATED_LAYER_NAMES.has(name))
  ) {
    if (node.nodes === undefined) {
      return true
    }
    return node.nodes.length > 0 && node.nodes.every(child => isWebpackTailwindGeneratedLayerNode(child, names))
  }
  if (node.nodes === undefined || node.nodes.length === 0) {
    return false
  }
  return node.nodes.every(child => isWebpackTailwindGeneratedPrefixNode(child))
}

function isWebpackTailwindGeneratedLayerNode(node: postcss.ChildNode, layerNames: string[]): boolean {
  if (node.type === 'rule') {
    return isWebpackTailwindGeneratedRule(node, layerNames, false)
  }
  if (node.type !== 'atrule') {
    return false
  }
  if (node.name === 'property' && node.params.trim().startsWith('--tw-')) {
    return true
  }
  if (node.nodes === undefined || node.nodes.length === 0) {
    return false
  }
  return node.nodes.every(child => isWebpackTailwindGeneratedLayerNode(child, layerNames))
}

function isWebpackTailwindGeneratedRule(rule: postcss.Rule, layerNames: string[], includePrefix: boolean): boolean {
  const selectors = rule.selectors ?? [rule.selector]
  if (selectors.every(selector => isWebpackTailwindGeneratedUtilitySelector(selector.trim(), includePrefix))) {
    return true
  }
  if (selectors.every(selector => isWebpackTailwindGeneratedUtilitySelector(selector.trim(), true))) {
    return true
  }
  if (layerNames.includes('theme') && isWebpackTailwindGeneratedThemeRule(rule)) {
    return true
  }
  if (layerNames.includes('base') && isWebpackTailwindGeneratedPreflightRule(rule)) {
    return true
  }
  return false
}

function isWebpackTailwindGeneratedThemeRule(rule: postcss.Rule): boolean {
  const declarations = (rule.nodes ?? []).filter((node): node is postcss.Declaration => node.type === 'decl')
  return declarations.length > 0
    && declarations.every(decl =>
      WEBPACK_TAILWIND_THEME_TOKEN_RE.test(decl.prop)
      || decl.value.includes('--theme('),
    )
}

function isWebpackTailwindGeneratedPreflightRule(rule: postcss.Rule): boolean {
  const selectors = rule.selectors ?? [rule.selector]
  const declarations = (rule.nodes ?? []).filter((node): node is postcss.Declaration => node.type === 'decl')
  return selectors.length > 0
    && declarations.length > 0
    && selectors.every((selector) => {
      const normalized = selector.trim().replace(/\s+/g, ' ')
      return WEBPACK_TAILWIND_PREFLIGHT_SELECTORS.has(normalized)
    })
    && declarations.every(decl => WEBPACK_TAILWIND_PREFLIGHT_PROPS.has(decl.prop))
}

function isOnlyWebpackTailwindGeneratedPreflightCss(source: string): boolean {
  try {
    const root = postcss.parse(source)
    const nodes = root.nodes ?? []
    return nodes.length > 0
      && nodes.every((node) => {
        if (node.type === 'rule') {
          return isWebpackTailwindGeneratedPreflightRule(node)
        }
        return node.type === 'atrule' && (node.nodes === undefined || node.nodes.length === 0)
      })
  }
  catch {
    return false
  }
}

function isWebpackTailwindGeneratedUtilitySelector(selector: string, includePrefix: boolean): boolean {
  return WEBPACK_TAILWIND_UTILITY_RULE_MARKER_RE.test(selector)
    || (includePrefix && WEBPACK_TAILWIND_UTILITY_PREFIX_RE.test(selector))
}

export function collectWebpackCssRuleIdentityMarkers(source: string) {
  const markers = new Set<string>()
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors) {
        for (const match of selector.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
          markers.add(`class:${match[1]}`)
        }
      }
    })
    root.walkAtRules('keyframes', (rule) => {
      if (rule.params) {
        markers.add(`keyframes:${rule.params}`)
      }
    })
  }
  catch {
  }
  return markers
}

export function unescapeCssIdentifier(value: string) {
  return value.replace(/\\([0-9a-f]{1,6}\s?|.)/gi, (_match, escaped: string) => {
    const hex = escaped.trim()
    if (/^[0-9a-f]+$/i.test(hex)) {
      return String.fromCodePoint(Number.parseInt(hex, 16))
    }
    return escaped
  })
}

export function collectGeneratedCssRuntimeCandidates(source: string) {
  const candidates = new Set<string>()
  if (
    hasBundlerGeneratedCssMarker(source)
    || (!hasTailwindGeneratedCss(source) && !hasTailwindGeneratedCssMarkers(source))
  ) {
    return candidates
  }
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors) {
        for (const match of selector.matchAll(/\.((?:\\.|[\w\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/g)) {
          const candidate = unescapeCssIdentifier(match[1]!)
          if (isRuntimeTransformCandidate(candidate)) {
            candidates.add(candidate)
          }
        }
      }
    })
  }
  catch {
  }
  return candidates
}

export function hasAdditionalWebpackAssetUserCssMarkers(
  rawSource: string,
  generatorRawSource: string,
) {
  const rawMarkers = collectWebpackAssetUserCssMarkers(rawSource)
  if (rawMarkers.size === 0) {
    return false
  }
  const generatorMarkers = collectWebpackAssetUserCssMarkers(generatorRawSource)
  for (const marker of rawMarkers) {
    if (!generatorMarkers.has(marker)) {
      return true
    }
  }
  return false
}

export function hasWebpackTailwindSourceDirectives(source: string | undefined) {
  return Boolean(source)
    && (
      hasTailwindRootDirectives(source!, { importFallback: true })
      || hasTailwindSourceDirectives(source!, { importFallback: true })
      || hasTailwindApplyDirective(source!)
      || hasTailwindGeneratedCss(source!)
      || hasTailwindGeneratedCssMarkers(source!)
    )
}

export function isWebpackTailwindImportRequest(request: string | undefined) {
  return request === 'tailwindcss'
    || request === 'tailwindcss4'
    || request?.startsWith('tailwindcss/')
    || request?.startsWith('tailwindcss4/')
    || request === 'weapp-tailwindcss'
    || request?.startsWith('weapp-tailwindcss/')
}

export function removeWebpackGeneratorNonTailwindImports(source: string | undefined) {
  if (!source?.includes('@import')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('import', (rule) => {
      const request = parseImportRequest(rule.params)
      if (isWebpackTailwindImportRequest(request)) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export function removeWebpackUserCssFallbackImports(source: string) {
  if (!source.includes('@import')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('import', (rule) => {
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export function normalizeWebpackUserCssFallbackSource(source: string) {
  const withoutImports = removeWebpackUserCssFallbackImports(source)
  if (!withoutImports.includes('@layer')) {
    return withoutImports
  }
  try {
    const root = postcss.parse(withoutImports)
    removeUnsupportedCascadeLayers(root)
    return root.toString()
  }
  catch {
    return withoutImports
  }
}

export function isWebpackCssSourceRepresentedInAsset(
  rawSource: string,
  sourceCss: string | undefined,
) {
  if (!sourceCss || !hasWebpackTailwindSourceDirectives(sourceCss)) {
    return false
  }
  const sourceMarkers = collectWebpackCssRuleIdentityMarkers(sourceCss)
  if (sourceMarkers.size === 0) {
    return false
  }
  const rawMarkers = collectWebpackCssRuleIdentityMarkers(rawSource)
  for (const marker of sourceMarkers) {
    if (!rawMarkers.has(marker)) {
      return false
    }
  }
  return true
}

export function createWebpackGeneratorCssSource(
  file: string | undefined,
  css: string | undefined,
) {
  if (!file || !css || !hasWebpackTailwindSourceDirectives(css)) {
    return undefined
  }
  return {
    file,
    base: path.dirname(file),
    css,
    dependencies: [file],
  }
}

export function createWebpackUserCssSourceAppend(
  sources: Iterable<{ css: string | undefined, file: string, processed?: boolean | undefined }>,
  generatorRawSource: string,
  currentSourceFile?: string | undefined,
  shouldIncludeSource?: ((file: string) => boolean) | undefined,
) {
  const matchedSources: Array<{ css: string, file: string, processed: boolean }> = []
  const seen = new Set<string>()
  for (const source of sources) {
    const css = source.css
    if (!css || seen.has(css)) {
      continue
    }
    if (shouldIncludeSource && !shouldIncludeSource(source.file)) {
      continue
    }
    seen.add(css)
    if (
      (source.processed === true || !css.includes('data:'))
      && hasAdditionalWebpackAssetUserCssMarkers(css, generatorRawSource)
    ) {
      matchedSources.push({
        css,
        file: source.file,
        processed: source.processed === true,
      })
    }
  }
  const currentFile = currentSourceFile ? path.resolve(currentSourceFile) : undefined
  const parts = matchedSources
    .sort((a, b) => {
      const aCurrent = currentFile !== undefined && path.resolve(a.file) === currentFile
      const bCurrent = currentFile !== undefined && path.resolve(b.file) === currentFile
      if (aCurrent !== bCurrent) {
        return aCurrent ? -1 : 1
      }
      return a.file.localeCompare(b.file)
    })
    .map(source => source.css)
  return parts.length > 0
    ? {
        css: parts.join('\n'),
        processed: matchedSources.every(source => source.processed),
      }
    : undefined
}

export function createWebpackGeneratorUserCssSourceAppend(
  ...sources: Array<WebpackGeneratorUserCssSource | undefined>
): WebpackGeneratorUserCssSource | undefined {
  const parts = sources.filter((source): source is WebpackGeneratorUserCssSource =>
    source !== undefined && source.css.trim().length > 0)
  if (parts.length === 0) {
    return undefined
  }
  let css = ''
  const usedParts: WebpackGeneratorUserCssSource[] = []
  for (const source of parts) {
    const nextCss = css.trim().length > 0
      ? filterExistingCssRules(css, source.css)
      : source.css
    const hasNextCss = nextCss.trim().length > 0
    if (!hasNextCss) {
      continue
    }
    css = createCssSourceOrderAppend(css, nextCss)
    usedParts.push(source)
  }
  return {
    css,
    processed: usedParts.every(source => source.processed),
  }
}

export function resolveWebpackMemoryDebugStats(context: {
  activeAssetFiles: number
  activeCssFiles: number
  activeProcessCacheKeys: Set<string>
  activeProcessHashKeys: Set<string | number>
  cache: SetupWebpackV5ProcessAssetsHookOptions['options']['cache']
  cssHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  cssUserHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  phase: string
  sourceCandidateScan: WebpackSourceCandidateScanMemoryStats
}) {
  if (process.env['WEAPP_TW_HMR_MEMORY_DEBUG'] !== '1') {
    return undefined
  }

  const memory = process.memoryUsage()
  const processCacheInstanceSize = context.cache.instance.size
  const processCacheHashMapSize = context.cache.hashMap.size
  return {
    phase: context.phase,
    process: {
      rssMb: toMb(memory.rss),
      heapTotalMb: toMb(memory.heapTotal),
      heapUsedMb: toMb(memory.heapUsed),
      externalMb: toMb(memory.external),
      arrayBuffersMb: toMb(memory.arrayBuffers),
    },
    assets: {
      active: context.activeAssetFiles,
      activeCss: context.activeCssFiles,
    },
    processCache: {
      instance: processCacheInstanceSize,
      hashMap: processCacheHashMapSize,
      activeCacheKeys: context.activeProcessCacheKeys.size,
      activeHashKeys: context.activeProcessHashKeys.size,
      staleCacheKeys: Math.max(0, processCacheInstanceSize - context.activeProcessCacheKeys.size),
      staleHashKeys: Math.max(0, processCacheHashMapSize - context.activeProcessHashKeys.size),
      pruned: true,
      pruneSkipped: false,
    },
    webpackCss: {
      handlerOptions: context.cssHandlerOptionsCache.size,
      userHandlerOptions: context.cssUserHandlerOptionsCache.size,
      maxHandlerOptions: WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX,
    },
    sourceCandidateScan: context.sourceCandidateScan,
    tailwind: {
      v4: getTailwindV4IncrementalGenerateCacheStats(),
    },
  }
}

export function shouldInjectWebpackCssTracePreflight(
  _appType: SetupWebpackV5ProcessAssetsHookOptions['appType'],
  cssHandlerOptions: Pick<WebpackCssHandlerOptions, 'isMainChunk' | 'sourceOptions'>,
) {
  if (includesTailwindPreflightImport(cssHandlerOptions.sourceOptions?.sourceCss)) {
    return true
  }
  return cssHandlerOptions.isMainChunk !== false
}

function includesTailwindPreflightImport(source: string | undefined) {
  if (!source) {
    return false
  }
  try {
    let includesPreflight = false
    postcss.parse(source).walkAtRules((rule) => {
      if (rule.name === 'tailwind') {
        includesPreflight ||= rule.params.trim() === 'base'
        return
      }
      if (rule.name !== 'import') {
        return
      }
      const request = parseImportRequest(rule.params)?.replaceAll('\\', '/')
      includesPreflight ||= request === 'tailwindcss'
        || request === 'tailwindcss/preflight.css'
        || request?.endsWith('/tailwindcss/index.css') === true
        || request?.endsWith('/tailwindcss/preflight.css') === true
    })
    return includesPreflight
  }
  catch {
    return false
  }
}

export function finalizeMiniProgramUserCssAssetSource(
  source: string,
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  isWebGeneratorTarget: boolean,
  options: { cssPreflight?: boolean | undefined } = {},
) {
  const styleOptions = resolveStyleOptionsFromContext(compilerOptions)
  if (isWebGeneratorTarget) {
    return source
  }
  const finalized = finalizeMiniProgramCss(removeMiniProgramHoverSelectors(source, styleOptions.cssRemoveHoverPseudoClass), {
    cssPreflight: options.cssPreflight === false
      ? false
      : !hasMiniProgramTailwindV4PreflightReset(source)
          ? resolveConfiguredWebpackCssPreflight(compilerOptions, styleOptions)
          : undefined,
    isTailwindcssV4: true,
    tailwindcssV4GradientFallback: styleOptions.tailwindcssV4GradientFallback,
  })
  const output = removeTailwindV4StandaloneHostPreflightRule(finalized)
  return stripMiniProgramCssSpecificityPlaceholders(output)
}

export function shouldFallbackToWebpackUserCssOnGeneratorError(options: {
  configuredMainCssEntryFilesLength: number
  generatorRawSource: string
  hasExplicitTailwindV4SourceCss: boolean
}) {
  return !hasTailwindRootDirectives(options.generatorRawSource, { importFallback: true })
    && !hasTailwindSourceDirectives(options.generatorRawSource, { importFallback: true })
    && !hasTailwindApplyDirective(options.generatorRawSource)
    && !options.hasExplicitTailwindV4SourceCss
    && options.configuredMainCssEntryFilesLength === 0
}

function isWindowsAbsoluteResourcePath(file: string) {
  return /^[a-z]:[\\/]/i.test(file) || /^[/\\]{2}[^/\\]/.test(file)
}

function isPosixAbsoluteResourcePath(file: string) {
  return file.startsWith('/')
}

function resolveWebpackResourcePath(file: string, base?: string | undefined) {
  if (isWindowsAbsoluteResourcePath(file)) {
    return path.win32.resolve(file)
  }
  if (isPosixAbsoluteResourcePath(file)) {
    return path.posix.resolve(file)
  }
  if (base) {
    if (isWindowsAbsoluteResourcePath(base)) {
      return path.win32.resolve(base, file)
    }
    if (isPosixAbsoluteResourcePath(base)) {
      return path.posix.resolve(base, file)
    }
    return path.resolve(base, file)
  }
  return undefined
}

function dirnameWebpackResourcePath(file: string) {
  if (isWindowsAbsoluteResourcePath(file)) {
    return path.win32.dirname(file)
  }
  if (isPosixAbsoluteResourcePath(file)) {
    return path.posix.dirname(file)
  }
  return path.dirname(file)
}

export function resolveWebpackCssAssetModuleResource(
  resource: string,
  issuer: { context?: string, resource?: string } | undefined,
  options: {
    appType?: SetupWebpackV5ProcessAssetsHookOptions['appType'] | undefined
    cssMatcher: (file: string) => boolean
  },
) {
  if (!isCssLikeModuleResource(resource, options.cssMatcher, options.appType)) {
    return undefined
  }
  const normalized = stripResourceQuery(resource)
  if (!normalized) {
    return undefined
  }
  const absoluteResource = resolveWebpackResourcePath(normalized)
  if (absoluteResource) {
    return absoluteResource
  }
  const issuerResource = issuer?.resource ? stripResourceQuery(issuer.resource) : undefined
  const issuerResourcePath = issuerResource ? resolveWebpackResourcePath(issuerResource) : undefined
  const issuerContext = issuerResourcePath
    ? dirnameWebpackResourcePath(issuerResourcePath)
    : issuer?.context
  return resolveWebpackResourcePath(normalized, issuerContext)
}

export function isSameWebpackCssSourceScope(options: {
  candidateSourceFile: string
  currentSourceFile?: string | undefined
  outputFile: string
  resourcesByAsset: ReadonlyMap<string, ReadonlySet<string>>
}) {
  if (!options.currentSourceFile) {
    return false
  }
  const candidateKey = resolveWebpackResourcePath(options.candidateSourceFile) ?? path.resolve(options.candidateSourceFile)
  const currentKey = resolveWebpackResourcePath(options.currentSourceFile) ?? path.resolve(options.currentSourceFile)
  if (candidateKey === currentKey) {
    return true
  }
  const outputResources = options.resourcesByAsset.get(options.outputFile)
  if (!outputResources) {
    return false
  }
  return [...outputResources].some((resource) => {
    return (resolveWebpackResourcePath(resource) ?? path.resolve(resource)) === candidateKey
  })
}

export function shouldAppendCurrentWebpackAssetUserCss(options: {
  currentAssetHasBundlerGeneratedMarker: boolean
  currentAssetHasUserCss: boolean
  currentAssetLooksGenerated: boolean
  registeredUserRawSource: WebpackGeneratorUserCssSource | undefined
  shouldPreserveGeneratedWebAssetUserCss: boolean
  sourceCssProcessed: boolean
}) {
  const hasGeneratedAssetUserCss = options.currentAssetLooksGenerated && options.currentAssetHasUserCss
  return !options.currentAssetHasBundlerGeneratedMarker
    && !options.shouldPreserveGeneratedWebAssetUserCss
    && (
      hasGeneratedAssetUserCss
      || (!options.sourceCssProcessed || options.registeredUserRawSource === undefined || options.currentAssetHasUserCss)
    )
    && !(options.sourceCssProcessed && options.currentAssetLooksGenerated && !options.currentAssetHasUserCss)
}

export function createWebpackCurrentAssetUserRawSource(options: {
  currentAssetHasUserCss: boolean
  currentAssetLooksGenerated: boolean
  currentAssetUserCssSource: string
  shouldAppendCurrentAssetUserCss: boolean
  sourceCssProcessed: boolean
}): WebpackGeneratorUserCssSource | undefined {
  if (!options.shouldAppendCurrentAssetUserCss) {
    return undefined
  }
  if (options.sourceCssProcessed) {
    return {
      css: options.currentAssetUserCssSource,
      processed: true,
    }
  }
  if (!options.currentAssetHasUserCss) {
    return undefined
  }
  return {
    css: options.currentAssetUserCssSource,
    processed: options.currentAssetLooksGenerated,
  }
}

export function finalizeTracedWebpackCssAsset(
  css: string,
  cssHandlerOptions: WebpackCssHandlerOptions,
  options: {
    annotateCss: (css: string) => string
    compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options']
    finalized?: boolean | undefined
    isWebGeneratorTarget: boolean
  },
) {
  if (options.finalized === true) {
    return options.annotateCss(css)
  }
  if (options.isWebGeneratorTarget || !isCssSourceTraceEnabled(options.compilerOptions)) {
    return options.annotateCss(css)
  }
  const finalized = finalizeMiniProgramUserCssAssetSource(
    css,
    options.compilerOptions,
    options.isWebGeneratorTarget,
    {
      cssPreflight: shouldInjectWebpackCssTracePreflight(options.compilerOptions.appType, cssHandlerOptions),
    },
  )
  return options.annotateCss(finalized)
}

export function finalizeWebpackCssAssetSource(
  source: string,
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  isWebGeneratorTarget: boolean,
  options: { cssPreflight?: boolean | undefined, generatedCss?: boolean, preserveExistingPreflight?: boolean | undefined } = {},
) {
  const styleOptions = resolveStyleOptionsFromContext(compilerOptions)
  if (isWebGeneratorTarget) {
    if (options.generatedCss === true) {
      return stripTrailingLineWhitespace(
        stripUnmatchedTailwindSourceMediaCloseFragments(
          stripTailwindSourceMediaFragments(
            stripBundlerGeneratedCssMarkers(source),
          ),
        ),
      )
    }
    const finalized = removeTailwindSourceDirectives(
      stripBundlerGeneratedCssMarkers(source),
      { importFallback: true },
    )
    return stripTrailingLineWhitespace(
      stripUnmatchedTailwindSourceMediaCloseFragments(
        stripTailwindSourceMediaFragments(
          removeTailwindV4GeneratorAtRules(finalized),
        ),
      ),
    )
  }
  let finalized = removeTailwindSourceDirectives(
    stripBundlerGeneratedCssMarkers(source),
    { importFallback: true },
  )
  if (options.generatedCss !== true) {
    finalized = finalizeMiniProgramCss(finalized, {
      cssPreflight: false,
      isTailwindcssV4: true,
      tailwindcssV4GradientFallback: styleOptions.tailwindcssV4GradientFallback,
    })
    finalized = dedupeMiniProgramPreflightSelectorRules(finalized)
    return stripMiniProgramCssSpecificityPlaceholders(removeMiniProgramHoverSelectors(finalized, styleOptions.cssRemoveHoverPseudoClass))
  }
  try {
    finalized = pruneMiniProgramGeneratedCss(finalized, {
      preservePreflight: options.cssPreflight !== false,
    })
  }
  catch {
  }
  const shouldRemoveExistingPreflight = options.cssPreflight === false && options.preserveExistingPreflight === false
  if (shouldRemoveExistingPreflight) {
    finalized = removeMiniProgramPreflightSelectorRule(finalized)
  }
  const hasExistingMiniProgramPreflight = options.preserveExistingPreflight !== false
    && hasMiniProgramPreflightSelector(source)
  finalized = finalizeMiniProgramCss(finalized, {
    cssPreflight: options.cssPreflight === false && !hasExistingMiniProgramPreflight
      ? false
      : !hasMiniProgramTailwindV4PreflightReset(finalized)
          ? resolveExistingWebpackCssPreflight(compilerOptions, styleOptions, source)
          : undefined,
    isTailwindcssV4: true,
    tailwindcssV4GradientFallback: styleOptions.tailwindcssV4GradientFallback,
  })
  finalized = ensureWebpackMiniProgramTwContentInit(finalized)
  if (shouldRemoveExistingPreflight) {
    finalized = removeMiniProgramPreflightSelectorRule(finalized)
  }
  else {
    finalized = dedupeMiniProgramPreflightSelectorRules(finalized)
  }
  return stripMiniProgramCssSpecificityPlaceholders(removeMiniProgramHoverSelectors(finalized, styleOptions.cssRemoveHoverPseudoClass))
}

export function finalizeWebpackCssAssetOutputSource(
  source: string,
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  isWebGeneratorTarget: boolean,
) {
  if (isWebGeneratorTarget) {
    return source
  }
  const styleOptions = resolveStyleOptionsFromContext(compilerOptions)
  return stripMiniProgramCssSpecificityPlaceholders(
    removeMiniProgramHoverSelectors(
      dedupeMiniProgramPreflightSelectorRules(source),
      styleOptions.cssRemoveHoverPseudoClass,
    ),
  )
}

export function collectWebpackJsRuntimeCandidatesFromAssets(options: {
  escapeFragments: ReturnType<typeof createEscapeFragments>
  getAssetSource: (file: string) => WebpackSourceLike | undefined
  isWebGeneratorTarget: boolean
  jsAssets: Iterable<string>
}) {
  if (options.isWebGeneratorTarget) {
    return undefined
  }
  const candidates = new Set<string>()
  for (const file of options.jsAssets) {
    const sourceLike = options.getAssetSource(file)
    if (sourceLike === undefined) {
      continue
    }
    const source = stringifyWebpackSourceLike(sourceLike)
    for (const candidate of collectStrictEscapedRuntimeCandidates(source, MappingChars2String, options.escapeFragments)) {
      if (isRuntimeTransformCandidate(candidate)) {
        candidates.add(candidate)
      }
    }
  }
  return candidates
}

export function collectWebpackJsRuntimeTokenSignature(options: {
  getAssetSource: (file: string) => WebpackSourceLike | undefined
  isWebGeneratorTarget: boolean
  jsAssets: Iterable<string>
}) {
  if (options.isWebGeneratorTarget) {
    return ''
  }
  const tokens: string[] = []
  for (const file of options.jsAssets) {
    const sourceLike = options.getAssetSource(file)
    if (sourceLike === undefined) {
      continue
    }
    tokens.push(...collectRuntimeTokenSignatureParts(stringifyWebpackSourceLike(sourceLike)))
  }
  return tokens.sort().join('\n')
}

export function addRuntimeTransformCandidates(
  target: Set<string>,
  candidates: ReadonlySet<string> | undefined,
) {
  if (!candidates?.size) {
    return
  }
  for (const candidate of candidates) {
    if (isRuntimeTransformCandidate(candidate)) {
      target.add(candidate)
    }
  }
}

export function createWebpackCssSourceTraceTokenSources(
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  webpackSourceCandidates: WebpackSourceCandidateCache | undefined,
) {
  if (!isCssSourceTraceEnabled(compilerOptions) || !webpackSourceCandidates) {
    return undefined
  }
  return createCssTokenSourceMap(webpackSourceCandidates.tokenSources, compilerOptions)
}

export function stringifyOptionalWebpackSourceValue(value: unknown) {
  return typeof value === 'string'
    ? value
    : value?.toString() ?? ''
}

export function stringifyWebpackSourceLike(source: WebpackSourceLike) {
  if (typeof source === 'string') {
    return source
  }
  const value = source.source()
  return typeof value === 'string' ? value : value.toString()
}
