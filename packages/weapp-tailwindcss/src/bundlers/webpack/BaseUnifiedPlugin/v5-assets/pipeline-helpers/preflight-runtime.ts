import type { TailwindV4CssSource } from '../../../../shared/generator-css/source-resolver/types'
import type { SourceCandidateStore } from '../../../../vite/source-candidates'
import type { SetupWebpackV5ProcessAssetsHookOptions } from '../helpers'
import type { resolveStyleOptionsFromContext } from '@/context/style-options'
import type { TailwindcssRuntimeLike } from '@/types'
import { postcss } from '@weapp-tailwindcss/postcss'
import { getDefaultCssPreflight } from '@/defaults'
import { collectGeneratedCssRuntimeCandidates } from './generated-css'
import { isRuntimeTransformCandidate } from './runtime-candidates'

export { isRuntimeTransformCandidate } from './runtime-candidates'

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

export const WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX = 128

export function resolveConfiguredWebpackCssPreflight(
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  styleOptions: ReturnType<typeof resolveStyleOptionsFromContext>,
) {
  return styleOptions.cssPreflight ?? compilerOptions.cssPreflight ?? getDefaultCssPreflight()
}

export function resolveExistingWebpackCssPreflight(
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options'],
  styleOptions: ReturnType<typeof resolveStyleOptionsFromContext>,
  source: string,
) {
  return hasMiniProgramPreflightSelector(source)
    ? resolveConfiguredWebpackCssPreflight(compilerOptions, styleOptions)
    : undefined
}

export function removeMiniProgramPreflightSelectorRule(source: string) {
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

export function dedupeMiniProgramPreflightSelectorRules(source: string) {
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

export function hasMiniProgramPreflightSelector(source: string) {
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

export function ensureWebpackMiniProgramTwContentInit(source: string) {
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
