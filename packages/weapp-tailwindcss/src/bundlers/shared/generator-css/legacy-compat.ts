import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindResolvedSource } from '@/generator'
import type { InternalUserDefinedOptions } from '@/types'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'
import { removeUnsupportedMiniProgramAtRules } from '../css-cleanup'
import { removeTailwindSourceDirectives, resolveCssEntrySource } from './directives'
import { collectDedupedPostTransformCompatCss, collectGeneratedSelectors, removeDuplicatedViteMarkers, removeGeneratedSelectorCompatCss } from './legacy-selectors'
import { createCssAppend, stripTailwindBanners } from './markers'
import { resolveCssSourceBase } from './source-resolver'

const LEGACY_CONTAINER_COMPAT_CSS = [
  '.container {',
  '  width: 100%;',
  '}',
  '@media (min-width: 40rem) {',
  '  .container {',
  '    max-width: 40rem;',
  '  }',
  '}',
  '@media (min-width: 48rem) {',
  '  .container {',
  '    max-width: 48rem;',
  '  }',
  '}',
  '@media (min-width: 64rem) {',
  '  .container {',
  '    max-width: 64rem;',
  '  }',
  '}',
  '@media (min-width: 80rem) {',
  '  .container {',
  '    max-width: 80rem;',
  '  }',
  '}',
  '@media (min-width: 96rem) {',
  '  .container {',
  '    max-width: 96rem;',
  '  }',
  '}',
].join('\n')

const LEGACY_COMPAT_CACHE_LIMIT = 128
const legacyCompatSourceCache = new Map<string, string>()
const legacyCompatTransformCache = new Map<string, string>()

function setLimitedCacheValue(cache: Map<string, string>, key: string, value: string) {
  if (cache.size >= LEGACY_COMPAT_CACHE_LIMIT) {
    const firstKey = cache.keys().next().value
    if (firstKey !== undefined) {
      cache.delete(firstKey)
    }
  }
  cache.set(key, value)
}

function createStableJson(value: unknown): string {
  if (value === undefined) {
    return 'undefined'
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(item => createStableJson(item)).join(',')}]`
  }
  return `{${Object.keys(value).sort().map((key) => {
    const record = value as Record<string, unknown>
    return `${JSON.stringify(key)}:${createStableJson(record[key])}`
  }).join(',')}}`
}

function createLegacyCompatTransformCacheKey(source: string, options: IStyleHandlerOptions) {
  return `${createStableJson(options)}\0${source}`
}

function countUnclosedBlocks(source: string) {
  let depth = 0
  let quote: string | undefined
  let inComment = false
  let escaped = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (inComment) {
      if (char === '*' && next === '/') {
        inComment = false
        index += 1
      }
      continue
    }

    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) {
        quote = undefined
      }
      continue
    }

    if (char === '/' && next === '*') {
      inComment = true
      index += 1
      continue
    }

    if (char === '"' || char === '\'') {
      quote = char
      continue
    }

    if (char === '{') {
      depth += 1
    }
    else if (char === '}' && depth > 0) {
      depth -= 1
    }
  }

  return depth
}

function closeTrailingUnclosedBlocks(source: string) {
  try {
    postcss.parse(source)
    return source
  }
  catch (error) {
    if ((error as { reason?: string }).reason !== 'Unclosed block') {
      return source
    }
    const unclosedBlocks = countUnclosedBlocks(source)
    return unclosedBlocks > 0 ? `${source}${'}'.repeat(unclosedBlocks)}` : source
  }
}

export function removeTailwindApplyRules(rawSource: string) {
  try {
    const root = postcss.parse(rawSource)
    let removed = false
    root.walkAtRules('apply', (rule) => {
      const parent = rule.parent
      if (parent?.type === 'rule') {
        parent.remove()
      }
      else {
        rule.remove()
      }
      removed = true
    })
    root.walkAtRules((rule) => {
      if (rule.nodes && rule.nodes.length === 0) {
        rule.remove()
      }
    })
    return removed ? root.toString() : rawSource
  }
  catch {
    return rawSource
  }
}

function resolveLegacyCompatCssSource(rawSource: string) {
  const cached = legacyCompatSourceCache.get(rawSource)
  if (cached !== undefined) {
    return cached
  }
  const parseableSource = closeTrailingUnclosedBlocks(stripTailwindBanners(rawSource))
  const source = removeTailwindSourceDirectives(parseableSource)
  const resolved = closeTrailingUnclosedBlocks(removeUnsupportedMiniProgramAtRules(removeTailwindApplyRules(source)))
  setLimitedCacheValue(legacyCompatSourceCache, rawSource, resolved)
  return resolved
}

function removeMiniProgramContainerCompatCss(css: string) {
  try {
    const root = postcss.parse(css)
    let removed = false
    root.walkRules((rule) => {
      if (rule.selectors?.length === 1 && rule.selectors[0] === '.container') {
        rule.remove()
        removed = true
      }
    })
    root.walkAtRules((atRule) => {
      if (atRule.nodes && atRule.nodes.length === 0) {
        atRule.remove()
        removed = true
      }
    })
    return removed ? root.toString() : css
  }
  catch {
    return css
  }
}

function hasContainerConfigToken(rawSource: string) {
  return rawSource.includes('@config') && /\bcontainer\b/.test(rawSource)
}

function hasConfiguredContainerCompat(rawSource: string, file: string, cssHandlerOptions: IStyleHandlerOptions) {
  if (hasContainerConfigToken(rawSource)) {
    return true
  }

  const base = resolveCssSourceBase(file, cssHandlerOptions)
  const cssEntrySource = resolveCssEntrySource(rawSource, base)
  if (!cssEntrySource?.config) {
    return false
  }

  try {
    return /\bcontainer\b/.test(readFileSync(cssEntrySource.config, 'utf8'))
  }
  catch {
    return false
  }
}

function hasConfiguredContainerCompatSource(source: TailwindResolvedSource) {
  if (hasContainerConfigToken(source.css)) {
    return true
  }

  const cssEntrySource = resolveCssEntrySource(source.css, source.base)
  if (cssEntrySource?.config) {
    try {
      if (/\bcontainer\b/.test(readFileSync(cssEntrySource.config, 'utf8'))) {
        return true
      }
    }
    catch {
      // 可选配置不可读时忽略，继续走其他兼容判断。
    }
  }

  if ('config' in source && source.config) {
    try {
      if (/\bcontainer\b/.test(readFileSync(source.config, 'utf8'))) {
        return true
      }
    }
    catch {
      // 可选配置不可读时忽略，继续走其他兼容判断。
    }
  }

  return false
}

export function hasConfiguredContainerCompatSources(sources: TailwindResolvedSource[]) {
  return sources.some(source => hasConfiguredContainerCompatSource(source))
}

export async function appendLegacyCompatCss(
  css: string,
  rawSource: string,
  generatorTarget: string,
  styleHandler: InternalUserDefinedOptions['styleHandler'],
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: Partial<IStyleHandlerOptions> | undefined,
) {
  const resolvedCompatSource = resolveLegacyCompatCssSource(rawSource)
  const compatSource = removeGeneratedSelectorCompatCss(
    generatorTarget === 'weapp'
      ? removeMiniProgramContainerCompatCss(resolvedCompatSource)
      : resolvedCompatSource,
    css,
  )
  if (compatSource.trim().length === 0) {
    return css
  }
  if (generatorTarget !== 'weapp') {
    return createCssAppend(css, compatSource)
  }

  const styleOptions = {
    ...cssHandlerOptions,
    ...generatorStyleOptions,
  }
  const compatCssCacheKey = createLegacyCompatTransformCacheKey(compatSource, styleOptions)
  let compatCss = legacyCompatTransformCache.get(compatCssCacheKey)
  if (compatCss === undefined) {
    const handled = await styleHandler(compatSource, styleOptions)
    compatCss = handled.css
    setLimitedCacheValue(legacyCompatTransformCache, compatCssCacheKey, compatCss)
  }
  const cleanedCompatCss = collectDedupedPostTransformCompatCss(
    removeDuplicatedViteMarkers(removeUnsupportedMiniProgramAtRules(compatCss), css),
    css,
  )
  if (cleanedCompatCss.trim().length === 0) {
    return css
  }
  return createCssAppend(css, cleanedCompatCss)
}

export async function appendLegacyContainerCompatCss(
  css: string,
  rawSource: string,
  file: string,
  runtime: Set<string>,
  configuredContainerCompat: boolean,
  generatorTarget: string,
  styleHandler: InternalUserDefinedOptions['styleHandler'],
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: Partial<IStyleHandlerOptions> | undefined,
) {
  if (generatorTarget === 'weapp') {
    return css
  }

  const compatSource = resolveLegacyCompatCssSource(rawSource)
  const shouldAppendContainer = runtime.has('container')
    || hasConfiguredContainerCompat(rawSource, file, cssHandlerOptions)
    || configuredContainerCompat
    || collectGeneratedSelectors(compatSource).has('.container')
  if (
    generatorTarget !== 'weapp'
    || !shouldAppendContainer
    || collectGeneratedSelectors(css).has('.container')
  ) {
    return css
  }

  const styleOptions = {
    ...cssHandlerOptions,
    ...generatorStyleOptions,
  }
  const compatCssCacheKey = createLegacyCompatTransformCacheKey(LEGACY_CONTAINER_COMPAT_CSS, styleOptions)
  let compatCss = legacyCompatTransformCache.get(compatCssCacheKey)
  if (compatCss === undefined) {
    const handled = await styleHandler(LEGACY_CONTAINER_COMPAT_CSS, styleOptions)
    compatCss = handled.css
    setLimitedCacheValue(legacyCompatTransformCache, compatCssCacheKey, compatCss)
  }
  const cleanedCompatCss = collectDedupedPostTransformCompatCss(
    removeUnsupportedMiniProgramAtRules(compatCss),
    css,
  )
  if (cleanedCompatCss.trim().length === 0) {
    return css
  }
  return createCssAppend(css, cleanedCompatCss)
}
