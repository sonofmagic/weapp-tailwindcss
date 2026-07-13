import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { GeneratorResolvedSource } from './source-resolver'
import type { createWeappTailwindcssGenerator } from '@/generator'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import { postcss } from '@weapp-tailwindcss/postcss'
import { resolveStyleOptionsFromContext } from '@/context/style-options'
import { isUniAppXEnabled } from '@/uni-app-x/options'
import { finalizeMiniProgramCss } from '../css-cleanup'
import { isVueScopedStyleRequest } from '../style-requests'
import {
  hasTailwindApplyDirective,
  hasTailwindRootDirectives,
  hasTailwindSourceDirectives,
} from './directives'
import {
  splitGeneratorPlaceholderCssBySourceOrder,
  splitTailwindGeneratedCssByBanner,
  splitTailwindV4GeneratedCssBySourceOrder,
} from './markers'
import { resolvePostcssFromOption } from './source-resolver/postcss-source'

export function hasMiniProgramTailwindV4PreflightReset(css: string) {
  return /(?:^|[},])\s*view\s*,\s*text\s*,\s*::after\s*,\s*::before\s*\{[^}]*\bborder\s*:\s*0\s+solid\b/.test(css)
}

function isMiniProgramGeneratorTarget(target: string) {
  return target !== 'web'
}

export function finalizeMiniProgramGeneratorCss(
  css: string,
  target: string,
  _majorVersion: number | undefined,
  cssPreflight: InternalUserDefinedOptions['cssPreflight'],
  options: { injectPreflight?: boolean, preservePreflight?: boolean, styleOptions?: Partial<IStyleHandlerOptions> | undefined } = {},
) {
  if (!isMiniProgramGeneratorTarget(target)) {
    return css
  }
  if (isVueScopedStyleRequest(options.styleOptions?.postcssOptions?.options?.from)) {
    return finalizeMiniProgramCss(css, {
      cssPreflight: false,
      cssSelectorReplacement: options.styleOptions?.cssOptions?.cssSelectorReplacement
        ?? options.styleOptions?.cssSelectorReplacement,
      isTailwindcssV4: true,
      tailwindcssV4GradientFallback: options.styleOptions?.cssOptions?.tailwindcssV4GradientFallback
        ?? options.styleOptions?.tailwindcssV4GradientFallback,
    })
  }
  const hasPreflightReset = hasMiniProgramTailwindV4PreflightReset(css)
  const injectPreflight = options.injectPreflight !== false
    && !hasPreflightReset
  const preservePreflight = options.preservePreflight !== false
  return finalizeMiniProgramCss(css, {
    cssPreflight: cssPreflight === false || (options.injectPreflight === false && (!hasPreflightReset || !preservePreflight))
      ? false
      : injectPreflight
        ? cssPreflight
        : hasPreflightReset && preservePreflight
          ? cssPreflight
          : undefined,
    cssSelectorReplacement: options.styleOptions?.cssOptions?.cssSelectorReplacement
      ?? options.styleOptions?.cssSelectorReplacement,
    isTailwindcssV4: true,
    tailwindcssV4GradientFallback: options.styleOptions?.cssOptions?.tailwindcssV4GradientFallback
      ?? options.styleOptions?.tailwindcssV4GradientFallback,
  })
}

export function resolveMiniProgramPreflightModeForGeneratorCss(
  opts: InternalUserDefinedOptions,
  options: {
    cssHandlerOptions: IStyleHandlerOptions
    isolateCurrentCssCandidates: boolean
    localImports?: string | undefined
    primaryCssSource?: boolean | undefined
    explicitCssSource?: boolean | undefined
  },
) {
  if (isVueScopedStyleRequest(resolvePostcssFromOption(options.cssHandlerOptions))) {
    return {
      inject: false,
      preserve: false,
    }
  }
  if (options.cssHandlerOptions.uniAppX === true && options.cssHandlerOptions.uniAppXCssTarget === 'uvue') {
    return {
      inject: false,
      preserve: false,
    }
  }
  const shouldInjectUniAppXLocalImportPreflight = isUniAppXEnabled(opts.uniAppX) && Boolean(options.localImports?.trim())
  if (opts.cssPreflight === false) {
    return {
      inject: false,
      preserve: false,
    }
  }
  if (options.primaryCssSource) {
    return {
      inject: true,
      preserve: true,
    }
  }
  if (options.explicitCssSource) {
    return {
      inject: false,
      preserve: true,
    }
  }
  if (options.cssHandlerOptions.isMainChunk) {
    return {
      inject: true,
      preserve: true,
    }
  }
  if (!options.cssHandlerOptions.isMainChunk && !options.primaryCssSource && !options.explicitCssSource) {
    return {
      inject: shouldInjectUniAppXLocalImportPreflight,
      preserve: shouldInjectUniAppXLocalImportPreflight,
    }
  }
  if (!options.isolateCurrentCssCandidates) {
    return {
      inject: true,
      preserve: true,
    }
  }
  return {
    inject: shouldInjectUniAppXLocalImportPreflight,
    preserve: shouldInjectUniAppXLocalImportPreflight,
  }
}

export function mergeScopedRuntimeWithCurrentRuntime(
  scopedRuntime: Set<string>,
  runtime: Set<string>,
  options: {
    currentCssCandidates?: string[] | undefined
    cssHandlerOptions: IStyleHandlerOptions
    isolateCssSource: boolean
    majorVersion?: number | undefined
    matchedCssSourceFile: boolean
  },
) {
  if (options.isolateCssSource) {
    if (options.matchedCssSourceFile) {
      return new Set([
        ...scopedRuntime,
        ...(options.currentCssCandidates ?? []),
      ])
    }
    return new Set([
      ...scopedRuntime,
      ...(options.currentCssCandidates ?? []),
    ])
  }
  if (
    runtime.size === 0
    || !options.cssHandlerOptions.isMainChunk
  ) {
    return scopedRuntime
  }
  return new Set([
    ...scopedRuntime,
    ...runtime,
  ])
}

export function shouldIsolateScopedCssSource(
  _majorVersion: number | undefined,
  source: GeneratorResolvedSource,
  sourceEntries: TailwindSourceEntry[] | undefined,
  options: {
    cssHandlerOptions?: IStyleHandlerOptions | undefined
    target: string
  },
) {
  if (options.target !== 'weapp') {
    return false
  }
  if (source.__weappTailwindcssMeta?.isolateCssSource) {
    return true
  }
  if (source.__weappTailwindcssMeta?.matchedCssSourceFile && (sourceEntries?.length ?? 0) > 0) {
    return true
  }
  if (sourceEntries?.length === 0) {
    return false
  }
  return sourceEntries !== undefined && options.cssHandlerOptions?.isMainChunk !== true
}

export function shouldIsolateCurrentTailwindV4CssCandidates(
  _majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    rawSource: string
  },
) {
  return !cssHandlerOptions.isMainChunk
    && hasTailwindApplyDirective(options.rawSource)
    && !hasTailwindRootDirectives(options.rawSource)
    && !options.hasGeneratedCss
    && !options.hasGeneratedMarkers
}

export function shouldScanTailwindV4Sources(
  majorVersion: number | undefined,
  target: string,
  generatorRuntime: Set<string>,
  isolateCssSource: boolean,
) {
  if (majorVersion !== 4) {
    throw new Error('weapp-tailwindcss 生成管线仅支持 Tailwind CSS v4。')
  }
  if (target === 'web') {
    return true
  }
  if (isolateCssSource) {
    return false
  }
  return generatorRuntime.size === 0
}

export function shouldAppendWebBundleCssFallback(
  target: string,
  _options: {
    hasSourceDirectives: boolean
    hasMatchedCssSourceFile: boolean
  },
) {
  return target === 'web'
}

export function isEmptyCssSourceOrderParts(parts: {
  before: string
  after: string
}) {
  return parts.before.trim().length === 0 && parts.after.trim().length === 0
}

export function resolveGeneratorStyleOptions(
  opts: InternalUserDefinedOptions,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: Partial<IStyleHandlerOptions> | undefined,
): Partial<IStyleHandlerOptions> {
  const resolvedStyleOptions = resolveStyleOptionsFromContext(opts)
  const scopedVueStyleSource = isVueScopedStyleRequest(resolvePostcssFromOption(cssHandlerOptions))
  const preflightStyleOptions: Partial<IStyleHandlerOptions> = {
    cssPreflight: scopedVueStyleSource ? false : resolvedStyleOptions.cssPreflight,
    cssPreflightRange: scopedVueStyleSource ? undefined : resolvedStyleOptions.cssPreflightRange,
  }
  return {
    ...resolvedStyleOptions,
    uniAppXCssTarget: opts.uniAppXCssTarget,
    uniAppXUnsupported: opts.uniAppXUnsupported,
    ...cssHandlerOptions,
    ...preflightStyleOptions,
    ...generatorStyleOptions,
  }
}

export function createCssSourceOrderAppend(base: string, extra: string) {
  if (!base) {
    return extra
  }
  if (!extra) {
    return base
  }
  if (/\s$/.test(base) || /^\s/.test(extra)) {
    return `${base}${extra}`
  }
  return `${base}\n${extra}`
}

const LEGACY_PSEUDO_ELEMENTS = ['before', 'after', 'first-letter', 'first-line'] as const
const CSS_STRING_LITERAL_RE = /(["'])((?:\\[\s\S]|(?!\1)[\s\S])*)\1/g

function isLegacyPseudoElementAt(selector: string, index: number) {
  for (const name of LEGACY_PSEUDO_ELEMENTS) {
    if (!selector.startsWith(name, index)) {
      continue
    }
    const next = selector[index + name.length]
    if (next === undefined || !/[\w-]/.test(next)) {
      return name
    }
  }
  return undefined
}

function normalizeLegacyPseudoElements(selector: string) {
  let result = ''
  let quote: string | undefined
  let bracketDepth = 0
  let index = 0
  while (index < selector.length) {
    const char = selector[index]
    if (char === '\\') {
      result += selector.slice(index, index + 2)
      index += 2
      continue
    }
    if (quote !== undefined) {
      result += char
      if (char === quote) {
        quote = undefined
      }
      index += 1
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      result += char
      index += 1
      continue
    }
    if (char === '[') {
      bracketDepth++
      result += char
      index += 1
      continue
    }
    if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1)
      result += char
      index += 1
      continue
    }
    if (bracketDepth === 0 && char === ':' && selector[index + 1] === ':') {
      result += '::'
      index += 2
      continue
    }
    if (bracketDepth === 0 && char === ':') {
      const name = isLegacyPseudoElementAt(selector, index + 1)
      if (name) {
        result += `::${name}`
        index += name.length + 1
        continue
      }
    }
    result += char
    index += 1
  }
  return result
}

function normalizeCssRuleDeduplicationSelector(selector: string) {
  return normalizeLegacyPseudoElements(selector)
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim()
}

function normalizeCssRuleDeduplicationValue(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(CSS_STRING_LITERAL_RE, (_match, _quote: string, content: string) => {
      const normalized = content
        .replace(/\\(["'])/g, '$1')
        .replace(/'/g, '\\\'')
      return `'${normalized}'`
    })
    .trim()
}

function createRuleDeduplicationKey(rule: postcss.Rule) {
  const parents: string[] = []
  let parent = rule.parent
  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule') {
      parents.push(`${parent.name}:${parent.params}`)
    }
    parent = parent.parent
  }
  const declarations = (rule.nodes ?? []).map((node) => {
    if (node.type === 'decl') {
      return `${node.prop}:${normalizeCssRuleDeduplicationValue(node.value)}:${node.important ? '1' : '0'}`
    }
    if (node.type === 'comment') {
      return ''
    }
    return normalizeCssRuleDeduplicationValue(node.toString())
  }).filter(Boolean)
  const selectors = (rule.selectors?.length ? rule.selectors : [rule.selector])
    .map(normalizeCssRuleDeduplicationSelector)
  return [
    parents.reverse().join('|'),
    selectors.join(','),
    declarations.join(';'),
  ].join('\n')
}

export function deduplicateGeneratedCssRules(css: string) {
  if (!css) {
    return css
  }
  try {
    const root = postcss.parse(css)
    const seen = new Set<string>()
    root.walkRules((rule) => {
      const key = createRuleDeduplicationKey(rule)
      if (seen.has(key)) {
        rule.remove()
        return
      }
      seen.add(key)
    })
    return root.toString()
  }
  catch {
    return css
  }
}

export function shouldFinalizeMarkedUserLayerComponentsCss(file: string) {
  return !/\.(?:vue|svelte|astro|scss|sass|less|styl)(?:[?#].*)?$/i.test(file)
}

export function splitRawSourceByGeneratedCssOrder(rawSource: string, rawTailwindCss: string) {
  const placeholderParts = splitGeneratorPlaceholderCssBySourceOrder(rawSource, rawTailwindCss)
  if (placeholderParts) {
    return placeholderParts
  }
  const exactParts = splitTailwindV4GeneratedCssBySourceOrder(rawSource, rawTailwindCss)
  if (exactParts) {
    return exactParts
  }
  return splitTailwindGeneratedCssByBanner(rawSource)
}

export function shouldUseGeneratorForCurrentCss(
  _majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    forceGenerator?: boolean | undefined
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    hasSourceDirectives: boolean
    rawSource: string
    runtimeCandidateCount?: number | undefined
    target?: string | undefined
    configuredCssSourceCount?: number | undefined
  },
) {
  const hasApplyDirectives = hasTailwindApplyDirective(options.rawSource)
  const sourceCss = (cssHandlerOptions as { sourceOptions?: { sourceCss?: string | undefined } | undefined }).sourceOptions?.sourceCss
  const hasSourceCssDirectives = typeof sourceCss === 'string'
    && (
      hasTailwindRootDirectives(sourceCss, { importFallback: true })
      || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
      || hasTailwindApplyDirective(sourceCss)
    )
  return options.forceGenerator === true
    || options.hasGeneratedCss
    || options.hasGeneratedMarkers
    || options.hasSourceDirectives
    || hasApplyDirectives
    || hasSourceCssDirectives
    || (
      cssHandlerOptions.isMainChunk
      && (options.configuredCssSourceCount ?? 0) > 0
    )
    || (
      cssHandlerOptions.isMainChunk
      && options.rawSource.includes('weapp-tailwindcss')
    )
    || (
      options.target === 'web'
      && cssHandlerOptions.isMainChunk
      && (options.runtimeCandidateCount ?? 0) > 0
    )
}

export function hasGeneratorSourceDirectives(source: string, importFallback: boolean) {
  return hasTailwindSourceDirectives(source, { importFallback })
}

export function createRuntimeWithCurrentCssCandidates(
  runtime: Set<string>,
  currentCssCandidates: string[],
  isolateCurrentCssCandidates: boolean,
) {
  return isolateCurrentCssCandidates
    ? new Set(currentCssCandidates)
    : currentCssCandidates.length > 0
      ? new Set([
          ...runtime,
          ...currentCssCandidates,
        ])
      : runtime
}

export function mergeGeneratorResults(generatedResults: GeneratorResult[]) {
  const firstGenerated = generatedResults[0]
  if (!firstGenerated) {
    return undefined
  }
  if (generatedResults.length === 1) {
    return firstGenerated
  }
  const incrementalCssResults = generatedResults
    .map(item => item.incrementalCss)
    .filter((css): css is string => typeof css === 'string')
  const incrementalRawCssResults = generatedResults
    .map(item => item.incrementalRawCss)
    .filter((css): css is string => typeof css === 'string')
  return {
    ...firstGenerated,
    css: deduplicateGeneratedCssRules(generatedResults.map(item => item.css).join('\n')),
    rawCss: deduplicateGeneratedCssRules(generatedResults.map(item => item.rawCss).join('\n')),
    incrementalCss: incrementalCssResults.length === generatedResults.length
      ? incrementalCssResults.filter(Boolean).join('\n')
      : undefined,
    incrementalRawCss: incrementalRawCssResults.length === generatedResults.length
      ? incrementalRawCssResults.filter(Boolean).join('\n')
      : undefined,
    classSet: new Set(generatedResults.flatMap(item => [...item.classSet])),
    dependencies: [...new Set(generatedResults.flatMap(item => item.dependencies))],
    sources: generatedResults.flatMap(item => item.sources),
  }
}
type GeneratorResult = Awaited<ReturnType<ReturnType<typeof createWeappTailwindcssGenerator>['generate']>>
