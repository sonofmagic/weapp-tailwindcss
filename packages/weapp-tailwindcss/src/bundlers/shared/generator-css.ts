import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import postcss from 'postcss'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV4SourceFromPatcher,
} from '@/generator'
import { finalizeMiniProgramCss, removeUnsupportedAtSupports } from './css-cleanup'

const TAILWIND_V4_BANNER_RE = /\/\*!\s*tailwindcss v4\./
const TAILWIND_GENERATED_CSS_MARKER_RE = /\/\*!\s*tailwindcss v|@property\s+--tw-|--tw-|:not\(#\\#\)|\.[^,{]*(?:\\:|\\\[|\\#)|(?::host|page|\.tw-root|wx-root-portal-content)[^{]*\{[^}]*--(?:color|spacing|text|font-weight|radius)-/
const GENERATOR_PLACEHOLDER_MARKER_RE = /\/\*!\s*weapp-tailwindcss generator-placeholder\s*\*\//i
const GENERATOR_PLACEHOLDER_MARKER_GLOBAL_RE = /\/\*!\s*weapp-tailwindcss generator-placeholder\s*\*\/\s*/gi
const TAILWIND_BANNER_PREFIX_RE = /^\/\*!\s*tailwindcss v[^*]*\*\/\s*/i
const TAILWIND_BANNER_RE = /\/\*!\s*tailwindcss v[^*]*\*\//i
const TAILWIND_BANNER_GLOBAL_RE = /\/\*!\s*tailwindcss v[^*]*\*\/\s*/gi
const VITE_MARKER_RE = /\/\*\$vite\$:[^*]*\*\//g
const CLASS_SELECTOR_RE = /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i
const MINI_PROGRAM_THEME_SCOPE_SELECTORS = new Set([':host', 'page', '.tw-root', 'wx-root-portal-content'])
const SUPPORTED_GENERATOR_MAJOR_VERSIONS = new Set([3, 4])
const REMOTE_IMPORT_RE = /^(?:https?:)?\/\//i
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

export interface GenerateCssByGeneratorOptions {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  runtime: Set<string>
  rawSource: string
  file: string
  cssHandlerOptions: IStyleHandlerOptions
  cssUserHandlerOptions: IStyleHandlerOptions
  styleHandler: InternalUserDefinedOptions['styleHandler']
  debug: (format: string, ...args: unknown[]) => void
}

export interface GenerateCssByGeneratorResult {
  css: string
  target: string
  source: 'generator' | 'generator-forced'
}

export function createCssAppend(base: string, extra: string) {
  if (!base) {
    return extra
  }
  if (!extra) {
    return base
  }
  return `${base}\n${extra}`
}

export function splitTailwindV4GeneratedCss(rawSource: string, rawTailwindCss: string) {
  const trimmedRaw = rawSource.trim()
  const trimmedTailwind = rawTailwindCss.trim()
  if (trimmedRaw === trimmedTailwind) {
    return ''
  }
  if (trimmedTailwind.startsWith(trimmedRaw)) {
    return ''
  }

  const start = rawSource.indexOf(rawTailwindCss)
  if (start === -1) {
    return
  }

  return createCssAppend(
    rawSource.slice(0, start),
    rawSource.slice(start + rawTailwindCss.length),
  )
}

export function removeTailwindGeneratedCssByBanner(rawSource: string) {
  const match = TAILWIND_BANNER_RE.exec(rawSource)
  if (!match || match.index === undefined) {
    return
  }
  const before = rawSource.slice(0, match.index)
  const after = rawSource.slice(match.index)
  const viteMarkers = [...after.matchAll(VITE_MARKER_RE)]
    .map(item => item[0])
    .join('\n')
  return createCssAppend(before, viteMarkers)
}

export function stripTailwindBanner(css: string) {
  return css.replace(TAILWIND_BANNER_PREFIX_RE, '')
}

export function stripTailwindBanners(css: string) {
  return css.replace(TAILWIND_BANNER_GLOBAL_RE, '')
}

export function stripGeneratorPlaceholderMarkers(css: string) {
  return css.replace(GENERATOR_PLACEHOLDER_MARKER_GLOBAL_RE, '')
}

export function hasTailwindGeneratedCss(rawSource: string) {
  return TAILWIND_V4_BANNER_RE.test(rawSource)
}

export function hasTailwindGeneratedCssMarkers(rawSource: string) {
  return TAILWIND_GENERATED_CSS_MARKER_RE.test(rawSource)
    || GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)
}

function finalizeMiniProgramGeneratorCss(css: string, target: string) {
  if (target !== 'weapp') {
    return css
  }
  return finalizeMiniProgramCss(css)
}

function parseImportRequest(params: string) {
  const match = /^(?:url\(\s*)?(["']?)([^"')\s]+)\1\s*\)?/.exec(params.trim())
  return match?.[2]
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
  return TAILWIND_REMOVABLE_SOURCE_DIRECTIVE_NAMES.has(node.name)
}

function isTailwindGenerationDirective(node: postcss.Node) {
  if (node.type !== 'atrule') {
    return false
  }
  return node.name === 'tailwind' || isTailwindImportAtRule(node)
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

function isLocalImportRequest(request: string) {
  return request.length > 0
    && !request.startsWith('tailwindcss')
    && !request.startsWith('weapp-tailwindcss')
    && !request.startsWith('data:')
    && !REMOTE_IMPORT_RE.test(request)
}

export function isPureLocalCssImportWrapper(css: string) {
  let hasImport = false
  try {
    const root = postcss.parse(css)
    for (const node of root.nodes) {
      if (node.type === 'comment') {
        continue
      }
      if (node.type !== 'atrule' || node.name !== 'import') {
        return false
      }
      const request = parseImportRequest(node.params)
      if (!request || !isLocalImportRequest(request)) {
        return false
      }
      hasImport = true
    }
  }
  catch {
    return false
  }
  return hasImport
}

function resolveLegacyCompatCssSource(rawSource: string) {
  const source = removeTailwindSourceDirectives(stripTailwindBanners(rawSource))
  return removeUnsupportedAtSupports(source)
}

function normalizeCssSelector(selector: string) {
  return selector.trim().replace(/\s+/g, '')
}

function hasClassSelector(selector: string) {
  return CLASS_SELECTOR_RE.test(selector)
}

function getNormalizedSelectorList(selector: string) {
  return selector.split(',').map(normalizeCssSelector).filter(Boolean)
}

function isMiniProgramThemeScopeSelector(selector: string) {
  const selectors = getNormalizedSelectorList(selector)
  return selectors.length > 0
    && selectors.every(item => MINI_PROGRAM_THEME_SCOPE_SELECTORS.has(item))
}

function hasUtilityClassSelector(selector: string) {
  return hasClassSelector(selector) && !isMiniProgramThemeScopeSelector(selector)
}

function isCustomPropertyOnlyRule(rule: postcss.Rule) {
  let hasDeclaration = false
  let allCustomProperties = true

  rule.each((node) => {
    if (node.type !== 'decl') {
      return
    }
    hasDeclaration = true
    if (!node.prop.startsWith('--')) {
      allCustomProperties = false
    }
  })

  return hasDeclaration && allCustomProperties
}

function isPseudoContentInitRule(rule: postcss.Rule) {
  let hasDeclaration = false
  let onlyContentVariable = true

  rule.each((node) => {
    if (node.type !== 'decl') {
      return
    }
    hasDeclaration = true
    if (node.prop !== '--tw-content') {
      onlyContentVariable = false
    }
  })

  return hasDeclaration && onlyContentVariable
}

function collectGeneratedSelectors(css: string) {
  const selectors = new Set<string>()
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      if (isCustomPropertyOnlyRule(rule) && !isPseudoContentInitRule(rule) && !hasUtilityClassSelector(rule.selector)) {
        return
      }
      selectors.add(normalizeCssSelector(rule.selector))
    })
  }
  catch {
    return selectors
  }
  return selectors
}

function removeGeneratedSelectorCompatCss(css: string, generatedCss: string) {
  const generatedSelectors = collectGeneratedSelectors(generatedCss)
  if (generatedSelectors.size === 0) {
    return css
  }

  try {
    const root = postcss.parse(css)
    let removed = false
    root.walkRules((rule) => {
      if (isPseudoContentInitRule(rule)) {
        rule.remove()
        removed = true
        return
      }
      if (isCustomPropertyOnlyRule(rule) && !isPseudoContentInitRule(rule) && !hasUtilityClassSelector(rule.selector)) {
        return
      }
      if (generatedSelectors.has(normalizeCssSelector(rule.selector))) {
        rule.remove()
        removed = true
      }
    })
    root.walkAtRules((atRule) => {
      if (!atRule.nodes || atRule.nodes.length === 0) {
        atRule.remove()
      }
    })
    return removed ? root.toString() : css
  }
  catch {
    return css
  }
}

function collectDedupedPostTransformCompatCss(css: string, generatedCss: string) {
  const generatedSelectors = collectGeneratedSelectors(generatedCss)
  if (generatedSelectors.size === 0) {
    return css
  }

  const preservedNodes: postcss.Node[] = []
  try {
    const root = postcss.parse(css)
    root.each((node) => {
      if (node.type === 'rule' && generatedSelectors.has(normalizeCssSelector(node.selector))) {
        if (isCustomPropertyOnlyRule(node) && !isPseudoContentInitRule(node) && !hasUtilityClassSelector(node.selector)) {
          const declarationProps = new Set<string>()
          node.walkDecls((decl) => {
            declarationProps.add(decl.prop)
          })
          const generatedRoot = postcss.parse(generatedCss)
          generatedRoot.walkRules((rule) => {
            if (normalizeCssSelector(rule.selector) !== normalizeCssSelector(node.selector)) {
              return
            }
            rule.walkDecls((decl) => {
              declarationProps.delete(decl.prop)
            })
          })
          const nextRule = node.clone()
          nextRule.walkDecls((decl) => {
            if (!declarationProps.has(decl.prop)) {
              decl.remove()
            }
          })
          if (nextRule.nodes.length > 0) {
            preservedNodes.push(nextRule)
          }
        }
        return
      }
      preservedNodes.push(node.clone())
    })
    if (preservedNodes.length === root.nodes.length) {
      return css
    }
    const nextRoot = postcss.root()
    nextRoot.append(preservedNodes)
    return nextRoot.toString()
  }
  catch {
    return css
  }
}

async function appendLegacyCompatCss(
  css: string,
  rawSource: string,
  generatorTarget: string,
  styleHandler: InternalUserDefinedOptions['styleHandler'],
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: IStyleHandlerOptions | undefined,
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
  const cleanedCompatCss = collectDedupedPostTransformCompatCss(removeUnsupportedAtSupports(compatCss), css)
  if (cleanedCompatCss.trim().length === 0) {
    return css
  }
  return createCssAppend(css, cleanedCompatCss)
}

export async function generateCssByGenerator(
  options: GenerateCssByGeneratorOptions,
): Promise<GenerateCssByGeneratorResult | undefined> {
  const {
    opts,
    runtimeState,
    runtime,
    rawSource,
    file,
    cssHandlerOptions,
    cssUserHandlerOptions,
    styleHandler,
    debug,
  } = options
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
  const majorVersion = runtimeState.twPatcher.majorVersion

  if (isPureLocalCssImportWrapper(rawSource)) {
    return undefined
  }

  const hasGeneratedCss = hasTailwindGeneratedCss(rawSource)
  const hasSourceDirectives = hasTailwindSourceDirectives(rawSource)
  const hasGeneratedMarkers = hasTailwindGeneratedCssMarkers(rawSource)
  const shouldForceGenerateCurrentCss = hasGeneratedCss
    || hasGeneratedMarkers
    || hasSourceDirectives

  if (
    generatorOptions.mode === 'off'
    || !SUPPORTED_GENERATOR_MAJOR_VERSIONS.has(majorVersion ?? 0)
    || (
      generatorOptions.mode === 'force'
      && !shouldForceGenerateCurrentCss
    )
    || (
      generatorOptions.mode !== 'force'
      && majorVersion !== 3
      && !hasGeneratedCss
    )
    || (
      !cssHandlerOptions.isMainChunk
      && majorVersion !== 3
      && generatorOptions.mode !== 'force'
      && !hasGeneratedCss
    )
  ) {
    return undefined
  }

  try {
    await runtimeState.patchPromise
    const source = majorVersion === 3
      ? await resolveTailwindV3SourceFromPatcher(runtimeState.twPatcher)
      : await resolveTailwindV4SourceFromPatcher(runtimeState.twPatcher)
    const generator = createWeappTailwindcssGenerator(source)
    const generated = await generator.generate({
      candidates: runtime,
      styleOptions: {
        ...cssHandlerOptions,
        ...generatorOptions.styleOptions,
      },
      target: generatorOptions.target,
    })
    const extraCss = splitTailwindV4GeneratedCss(rawSource, generated.rawCss)
    if (typeof extraCss === 'string') {
      let css = stripTailwindBanner(generated.css)
      if (extraCss.trim().length > 0) {
        const cleanedExtraCss = removeTailwindSourceDirectives(extraCss)
        if (cleanedExtraCss.trim().length > 0) {
          const extraSource = generated.target === 'weapp'
            ? removeUnsupportedAtSupports(cleanedExtraCss)
            : cleanedExtraCss
          if (extraSource.trim().length === 0) {
            return {
              css: finalizeMiniProgramGeneratorCss(css, generated.target),
              target: generated.target,
              source: 'generator',
            }
          }
          if (generated.target === 'weapp') {
            const { css: userCss } = await styleHandler(extraSource, {
              ...cssUserHandlerOptions,
              ...generatorOptions.styleOptions,
            })
            css = createCssAppend(css, removeUnsupportedAtSupports(userCss))
          }
          else {
            css = createCssAppend(css, extraSource)
          }
        }
      }
      return {
        css: finalizeMiniProgramGeneratorCss(css, generated.target),
        target: generated.target,
        source: 'generator',
      }
    }

    if (generatorOptions.mode === 'force') {
      debug(
        'tailwind direct css generation prefix mismatch, append transformed bundle css %s',
        file,
      )
      let css = stripTailwindBanner(generated.css)
      css = await appendLegacyCompatCss(
        css,
        rawSource,
        generated.target,
        styleHandler,
        cssHandlerOptions,
        generatorOptions.styleOptions as IStyleHandlerOptions | undefined,
      )
      return {
        css: finalizeMiniProgramGeneratorCss(css, generated.target),
        target: generated.target,
        source: 'generator-forced',
      }
    }
  }
  catch (error) {
    if (generatorOptions.mode === 'force') {
      throw error
    }
    debug('tailwind direct css generation failed, fallback to styleHandler: %s %O', file, error)
  }

  return undefined
}
