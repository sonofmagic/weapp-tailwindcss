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
  const source = removeTailwindSourceDirectives(stripTailwindBanners(rawSource))
  return removeUnsupportedMiniProgramAtRules(removeTailwindApplyRules(source))
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
  const compatSource = removeGeneratedSelectorCompatCss(resolveLegacyCompatCssSource(rawSource), css)
  if (compatSource.trim().length === 0) {
    return css
  }
  if (generatorTarget !== 'weapp') {
    return createCssAppend(css, compatSource)
  }

  const { css: compatCss } = await styleHandler(compatSource, {
    ...cssHandlerOptions,
    ...generatorStyleOptions,
  })
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

  const { css: compatCss } = await styleHandler(LEGACY_CONTAINER_COMPAT_CSS, {
    ...cssHandlerOptions,
    ...generatorStyleOptions,
  })
  const cleanedCompatCss = collectDedupedPostTransformCompatCss(
    removeUnsupportedMiniProgramAtRules(compatCss),
    css,
  )
  if (cleanedCompatCss.trim().length === 0) {
    return css
  }
  return createCssAppend(css, cleanedCompatCss)
}
