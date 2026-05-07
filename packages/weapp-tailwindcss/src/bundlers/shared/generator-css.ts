import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindResolvedSource } from '@/generator'
import type { InternalUserDefinedOptions } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import postcss from 'postcss'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3Source,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV3SourceOptionsFromPatcher,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromPatcher,
  resolveTailwindV4SourceOptionsFromPatcher,
} from '@/generator'
import { replaceWxml } from '@/wxml'
import { finalizeMiniProgramCss, removeUnsupportedMiniProgramAtRules } from './css-cleanup'

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
const SPECIFICITY_PLACEHOLDER_RE = /:not\(#(?:\\#|n)\)/g
const CSS_LENGTH_UNIT_RE = /(?:^|[\s(,])[-+]?(?:\d+|\d*\.\d+)(?:px|rem)\b/i
const RPX_UNIT_RE = /(?:^|[\s(,])[-+]?(?:\d+|\d*\.\d+)rpx\b/i
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
const SOURCE_STYLE_EXTENSIONS = [
  '.vue',
  '.uvue',
  '.nvue',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.styl',
  '.stylus',
  '.wxss',
  '.acss',
  '.jxss',
  '.ttss',
  '.qss',
]
const SFC_STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi

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

function normalizeCompatSelector(selector: string) {
  return selector
    .replace(SPECIFICITY_PLACEHOLDER_RE, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isClassSelectorTerminator(char: string) {
  return /[\s>+~#,.:()[\]]/.test(char)
}

function unescapeSimpleCssIdent(value: string) {
  return value.replaceAll(/\\(.)/g, '$1')
}

function escapeCompatSelectorClasses(selector: string) {
  let result = ''
  let index = 0
  let changed = false
  while (index < selector.length) {
    const char = selector[index]
    if (char !== '.') {
      result += char
      index += 1
      continue
    }

    let end = index + 1
    let className = ''
    while (end < selector.length) {
      const current = selector[end]
      if (current === '\\' && end + 1 < selector.length) {
        className += current + selector[end + 1]
        end += 2
        continue
      }
      if (isClassSelectorTerminator(current)) {
        break
      }
      className += current
      end += 1
    }

    if (className.includes('\\')) {
      result += `.${replaceWxml(unescapeSimpleCssIdent(className))}`
      changed = true
    }
    else {
      result += `.${className}`
    }
    index = end
  }
  return changed ? result : selector
}

function normalizeCompatSelectors(selector: string) {
  const normalized = normalizeCompatSelector(selector)
  if (!normalized) {
    return []
  }
  const selectors = new Set([normalized])
  const escaped = normalizeCompatSelector(escapeCompatSelectorClasses(normalized))
  if (escaped) {
    selectors.add(escaped)
  }
  return [...selectors]
}

function createLegacyDeclarationValueMap(css: string) {
  const values = new Map<string, string>()
  const root = postcss.parse(css)
  root.walkRules((rule) => {
    if (!rule.selectors || rule.selectors.length === 0) {
      return
    }
    for (const selector of rule.selectors) {
      const normalizedSelectors = normalizeCompatSelectors(selector)
      rule.walkDecls((decl) => {
        if (RPX_UNIT_RE.test(decl.value)) {
          for (const normalizedSelector of normalizedSelectors) {
            values.set(`${normalizedSelector}\n${decl.prop}`, decl.value)
          }
        }
      })
    }
  })
  return values
}

export function inheritLegacyUnitConvertedDeclarations(css: string, legacyCss: string) {
  try {
    const legacyValues = createLegacyDeclarationValueMap(legacyCss)
    if (legacyValues.size === 0) {
      return css
    }

    const root = postcss.parse(css)
    let changed = false
    root.walkRules((rule) => {
      if (!rule.selectors || rule.selectors.length === 0) {
        return
      }
      const selectors = rule.selectors
        .flatMap(selector => normalizeCompatSelectors(selector))
      if (selectors.length === 0) {
        return
      }

      rule.walkDecls((decl) => {
        if (!CSS_LENGTH_UNIT_RE.test(decl.value)) {
          return
        }
        for (const selector of selectors) {
          const legacyValue = legacyValues.get(`${selector}\n${decl.prop}`)
          if (legacyValue && legacyValue !== decl.value) {
            decl.value = legacyValue
            changed = true
            return
          }
        }
      })
    })

    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}

function resolveGeneratorStyleOptions(
  opts: InternalUserDefinedOptions,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: Partial<IStyleHandlerOptions> | undefined,
): Partial<IStyleHandlerOptions> {
  return {
    cssChildCombinatorReplaceValue: opts.cssChildCombinatorReplaceValue,
    cssSelectorReplacement: opts.cssSelectorReplacement,
    rem2rpx: opts.rem2rpx,
    px2rpx: opts.px2rpx,
    unitsToPx: opts.unitsToPx,
    cssRemoveProperty: opts.cssRemoveProperty,
    cssRemoveHoverPseudoClass: opts.cssRemoveHoverPseudoClass,
    cssPresetEnv: opts.cssPresetEnv,
    autoprefixer: opts.autoprefixer,
    cssCalc: opts.cssCalc,
    atRules: opts.atRules,
    uniAppX: opts.uniAppX,
    uniAppXCssTarget: opts.uniAppXCssTarget,
    uniAppXUnsupported: opts.uniAppXUnsupported,
    ...cssHandlerOptions,
    ...generatorStyleOptions,
  }
}

function parseImportRequest(params: string) {
  const match = /^(?:url\(\s*)?(["']?)([^"')\s]+)\1\s*\)?/.exec(params.trim())
  return match?.[2]
}

function parseConfigRequest(params: string) {
  const match = /^(["'])(.+)\1\s*;?$/.exec(params.trim())
  return match?.[2]
}

function resolvePostcssFromOption(cssHandlerOptions: IStyleHandlerOptions) {
  const from = cssHandlerOptions.postcssOptions?.options?.from
  return typeof from === 'string' && from.length > 0 ? from : undefined
}

function resolveCssSourceBase(file: string, cssHandlerOptions: IStyleHandlerOptions) {
  const from = resolvePostcssFromOption(cssHandlerOptions)
  const baseFile = from ?? file
  const normalized = baseFile.replace(/[?#].*$/, '')
  return path.dirname(path.resolve(normalized))
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
  return isTailwindImportAtRule(node)
    || node.name === 'layer'
    || node.name === 'config'
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
          config = path.isAbsolute(configPath) ? configPath : path.resolve(base, configPath)
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

function resolveExistingConfigPath(
  config: string | undefined,
  configRequest: string | undefined,
  file: string,
  sourceOptions: {
    projectRoot?: string
    cwd?: string
    config?: string
  },
) {
  if (config && existsSync(config)) {
    return config
  }
  if (!configRequest || path.isAbsolute(configRequest)) {
    return sourceOptions.config
  }

  const outputDir = path.dirname(file.replace(/[?#].*$/, ''))
  const baseCandidates = [
    sourceOptions.projectRoot,
    sourceOptions.cwd,
    process.cwd(),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)

  for (const base of baseCandidates) {
    const candidates = [
      path.resolve(base, configRequest),
      path.resolve(base, 'src', configRequest),
      path.resolve(base, outputDir, configRequest),
      path.resolve(base, 'src', outputDir, configRequest),
    ]
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate
      }
    }
  }

  return sourceOptions.config
}

function stripStyleExtension(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  return normalized.replace(/\.(?:wx|ac|jx|tt|q|c|ty)?ss$/i, '')
}

function createSourceStylePathCandidates(
  file: string,
  sourceOptions: {
    projectRoot?: string
    cwd?: string
  },
) {
  const bases = [
    sourceOptions.projectRoot,
    sourceOptions.cwd,
    process.cwd(),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  const strippedFile = stripStyleExtension(file)
  const relativeFiles = new Set<string>()

  if (path.isAbsolute(strippedFile)) {
    for (const base of bases) {
      const relative = path.relative(base, strippedFile)
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
        continue
      }
      relativeFiles.add(relative)
      const parts = relative.split(path.sep).filter(Boolean)
      if (parts.length > 1) {
        relativeFiles.add(parts.slice(1).join(path.sep))
        const distIndex = parts.lastIndexOf('dist')
        if (distIndex >= 0 && distIndex < parts.length - 1) {
          relativeFiles.add([
            ...parts.slice(0, distIndex),
            ...parts.slice(distIndex + 1),
          ].join(path.sep))
        }
      }
    }
  }
  else {
    relativeFiles.add(strippedFile)
    const parts = strippedFile.split(/[\\/]/).filter(Boolean)
    if (parts.length > 1) {
      relativeFiles.add(parts.slice(1).join(path.sep))
      const distIndex = parts.lastIndexOf('dist')
      if (distIndex >= 0 && distIndex < parts.length - 1) {
        relativeFiles.add([
          ...parts.slice(0, distIndex),
          ...parts.slice(distIndex + 1),
        ].join(path.sep))
      }
    }
  }

  const candidates = new Set<string>()

  for (const relativeFile of relativeFiles) {
    if (!relativeFile || path.isAbsolute(relativeFile)) {
      continue
    }
    for (const base of bases) {
      for (const sourceRoot of ['', 'src']) {
        const prefix = sourceRoot ? path.resolve(base, sourceRoot, relativeFile) : path.resolve(base, relativeFile)
        for (const extension of SOURCE_STYLE_EXTENSIONS) {
          candidates.add(`${prefix}${extension}`)
        }
      }
    }
  }

  return [...candidates]
}

function extractStyleDirectiveSources(source: string) {
  const styleSources: string[] = []
  SFC_STYLE_BLOCK_RE.lastIndex = 0
  let match = SFC_STYLE_BLOCK_RE.exec(source)
  while (match !== null) {
    const styleSource = match[1] ?? ''
    if (hasTailwindSourceDirectives(styleSource)) {
      styleSources.push(styleSource)
    }
    match = SFC_STYLE_BLOCK_RE.exec(source)
  }
  if (styleSources.length > 0) {
    return styleSources
  }
  return hasTailwindSourceDirectives(source) ? [source] : []
}

function shouldResolveSourceSideCssEntry(rawSource: string) {
  return rawSource.includes('@apply')
}

function resolveSourceSideCssEntrySource(
  file: string,
  sourceOptions: {
    projectRoot?: string
    cwd?: string
  },
  resolveOptions: { removeConfig?: boolean } = {},
) {
  for (const sourceFile of createSourceStylePathCandidates(file, sourceOptions)) {
    if (!existsSync(sourceFile)) {
      continue
    }
    try {
      const source = readFileSync(sourceFile, 'utf8')
      for (const styleSource of extractStyleDirectiveSources(source)) {
        const cssEntrySource = resolveCssEntrySource(styleSource, path.dirname(sourceFile), resolveOptions)
        if (cssEntrySource) {
          return cssEntrySource
        }
      }
    }
    catch {
      continue
    }
  }
}

function tryResolveTailwindV4SourceOptions(
  runtimeState: GenerateCssByGeneratorOptions['runtimeState'],
) {
  try {
    return resolveTailwindV4SourceOptionsFromPatcher(runtimeState.twPatcher)
  }
  catch {
    return undefined
  }
}

export async function resolveGeneratorSource(
  majorVersion: number | undefined,
  runtimeState: GenerateCssByGeneratorOptions['runtimeState'],
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
) {
  const base = resolveCssSourceBase(file, cssHandlerOptions)
  const cssEntrySource = resolveCssEntrySource(rawSource, base, { removeConfig: majorVersion === 3 })
  if (majorVersion === 3) {
    const sourceOptions = resolveTailwindV3SourceOptionsFromPatcher(runtimeState.twPatcher)
    const sourceSideEntrySource = resolveSourceSideCssEntrySource(file, sourceOptions, { removeConfig: true })
    const resolvedEntrySource = cssEntrySource ?? sourceSideEntrySource
    if (!resolvedEntrySource) {
      return resolveTailwindV3SourceFromPatcher(runtimeState.twPatcher)
    }
    const config = resolveExistingConfigPath(
      resolvedEntrySource.config,
      resolvedEntrySource.configRequest,
      file,
      sourceOptions,
    )
    return resolveTailwindV3Source({
      ...sourceOptions,
      base: resolvedEntrySource.base,
      css: resolvedEntrySource.css,
      ...(config ? { config } : {}),
    })
  }

  const sourceOptions = tryResolveTailwindV4SourceOptions(runtimeState)
  const shouldPreferSourceSideEntry = shouldResolveSourceSideCssEntry(rawSource)
    || Boolean(cssEntrySource?.css.includes('weapp-tailwindcss generator-placeholder'))
  const sourceSideEntrySource = sourceOptions && shouldPreferSourceSideEntry
    ? resolveSourceSideCssEntrySource(file, sourceOptions, { removeConfig: false })
    : undefined
  const resolvedEntrySource = sourceSideEntrySource ?? cssEntrySource
  if (!resolvedEntrySource) {
    return resolveTailwindV4SourceFromPatcher(runtimeState.twPatcher)
  }
  const resolvedSourceOptions = sourceOptions ?? {}
  return resolveTailwindV4Source({
    ...resolvedSourceOptions,
    base: resolvedEntrySource.base,
    css: resolvedEntrySource.css,
  })
}

async function resolveGeneratorSources(
  majorVersion: number | undefined,
  runtimeState: GenerateCssByGeneratorOptions['runtimeState'],
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
): Promise<TailwindResolvedSource[]> {
  const base = resolveCssSourceBase(file, cssHandlerOptions)
  const cssEntrySource = resolveCssEntrySource(rawSource, base, { removeConfig: majorVersion === 3 })
  if (majorVersion !== 4 || (cssEntrySource && !cssHandlerOptions.isMainChunk)) {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions),
    ]
  }

  let sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher>
  try {
    sourceOptions = resolveTailwindV4SourceOptionsFromPatcher(runtimeState.twPatcher)
  }
  catch {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions),
    ]
  }

  if (!sourceOptions.cssEntries || sourceOptions.cssEntries.length <= 1) {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions),
    ]
  }

  const sources = await Promise.all(sourceOptions.cssEntries.map(cssEntry =>
    resolveTailwindV4Source({
      ...sourceOptions,
      css: undefined,
      cssEntries: [cssEntry],
    }),
  ))
  return sources
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
  return removeUnsupportedMiniProgramAtRules(source)
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

function hasConfiguredContainerCompatSources(sources: TailwindResolvedSource[]) {
  return sources.some(source => hasConfiguredContainerCompatSource(source))
}

function removeDuplicatedViteMarkers(css: string, baseCss: string) {
  if (!VITE_MARKER_RE.test(baseCss)) {
    return css
  }
  VITE_MARKER_RE.lastIndex = 0
  return css.replace(VITE_MARKER_RE, '')
}

function normalizeCssSelector(selector: string) {
  return selector.trim().replace(/\s+/g, '')
}

function getCompatSelectorKeys(selector: string) {
  return normalizeCompatSelectors(selector).map(normalizeCssSelector)
}

function getRuleCompatSelectorKeys(rule: postcss.Rule) {
  return (rule.selectors?.length ? rule.selectors : [rule.selector])
    .flatMap(selector => getCompatSelectorKeys(selector))
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
      for (const selector of getRuleCompatSelectorKeys(rule)) {
        selectors.add(selector)
      }
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
      if (getRuleCompatSelectorKeys(rule).some(selector => generatedSelectors.has(selector))) {
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
      if (node.type === 'rule' && getRuleCompatSelectorKeys(node).some(selector => generatedSelectors.has(selector))) {
        if (isCustomPropertyOnlyRule(node) && !isPseudoContentInitRule(node) && !hasUtilityClassSelector(node.selector)) {
          const declarationProps = new Set<string>()
          node.walkDecls((decl) => {
            declarationProps.add(decl.prop)
          })
          const generatedRoot = postcss.parse(generatedCss)
          generatedRoot.walkRules((rule) => {
            const nodeSelectors = new Set(getRuleCompatSelectorKeys(node))
            if (!getRuleCompatSelectorKeys(rule).some(selector => nodeSelectors.has(selector))) {
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

async function appendLegacyContainerCompatCss(
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
    || cssHandlerOptions.isMainChunk
  const shouldAutoGenerateCurrentCss = hasGeneratedCss
    || hasGeneratedMarkers
    || hasSourceDirectives

  if (
    generatorOptions.mode === 'off'
    || !SUPPORTED_GENERATOR_MAJOR_VERSIONS.has(majorVersion ?? 0)
    || (
      generatorOptions.mode === 'force'
        ? !shouldForceGenerateCurrentCss
        : !shouldAutoGenerateCurrentCss
    )
    || (
      generatorOptions.mode === 'force'
      && (
        majorVersion === 3
        && !hasSourceDirectives
        && !hasGeneratedCss
        && !hasGeneratedMarkers
      )
    )
    || (
      generatorOptions.mode !== 'force'
      && majorVersion === 3
    )
  ) {
    return undefined
  }

  try {
    await runtimeState.patchPromise
    const sources = await resolveGeneratorSources(
      majorVersion,
      runtimeState,
      rawSource,
      file,
      cssHandlerOptions,
    )
    const generatorStyleOptions = resolveGeneratorStyleOptions(opts, cssHandlerOptions, generatorOptions.styleOptions)
    const configuredContainerCompat = hasConfiguredContainerCompatSources(sources)
    const generatedResults = await Promise.all(sources.map(async (source) => {
      const generator = createWeappTailwindcssGenerator(source)
      return generator.generate({
        candidates: runtime,
        scanSources: false,
        styleOptions: generatorStyleOptions,
        tailwindcssV3Compatibility: generatorOptions.tailwindcssV3Compatibility,
        target: generatorOptions.target,
      })
    }))
    const firstGenerated = generatedResults[0]
    if (!firstGenerated) {
      return undefined
    }
    const generated = generatedResults.length === 1
      ? firstGenerated
      : {
          ...firstGenerated,
          css: generatedResults.map(item => item.css).join('\n'),
          rawCss: generatedResults.map(item => item.rawCss).join('\n'),
          classSet: new Set(generatedResults.flatMap(item => [...item.classSet])),
          dependencies: [...new Set(generatedResults.flatMap(item => item.dependencies))],
          sources: generatedResults.flatMap(item => item.sources),
        }
    debug(
      'tailwind generator result: %s rawBytes=%d cssBytes=%d candidates=%d',
      file,
      generated.rawCss.length,
      generated.css.length,
      generated.classSet.size,
    )
    const extraCss = splitTailwindV4GeneratedCss(rawSource, generated.rawCss)
    if (typeof extraCss === 'string') {
      let css = stripTailwindBanner(generated.css)
      if (generated.target === 'weapp') {
        css = inheritLegacyUnitConvertedDeclarations(css, rawSource)
      }
      if (extraCss.trim().length > 0) {
        const cleanedExtraCss = removeTailwindSourceDirectives(extraCss)
        if (cleanedExtraCss.trim().length > 0) {
          const extraSource = generated.target === 'weapp'
            ? removeUnsupportedMiniProgramAtRules(cleanedExtraCss)
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
              ...generatorStyleOptions,
              ...cssUserHandlerOptions,
            })
            css = createCssAppend(css, removeUnsupportedMiniProgramAtRules(userCss))
          }
          else {
            css = createCssAppend(css, extraSource)
          }
        }
      }
      if (generated.target === 'weapp' && generatorOptions.mode === 'force') {
        css = await appendLegacyCompatCss(
          css,
          rawSource,
          generated.target,
          styleHandler,
          cssHandlerOptions,
          generatorStyleOptions,
        )
        css = await appendLegacyContainerCompatCss(
          css,
          rawSource,
          file,
          runtime,
          configuredContainerCompat,
          generated.target,
          styleHandler,
          cssHandlerOptions,
          generatorStyleOptions,
        )
      }
      return {
        css: finalizeMiniProgramGeneratorCss(css, generated.target),
        target: generated.target,
        source: 'generator',
      }
    }

    debug(
      'tailwind direct css generation prefix mismatch, append transformed bundle css %s',
      file,
    )
    let css = stripTailwindBanner(generated.css)
    if (generated.target === 'weapp') {
      css = inheritLegacyUnitConvertedDeclarations(css, rawSource)
    }
    css = await appendLegacyCompatCss(
      css,
      rawSource,
      generated.target,
      styleHandler,
      cssHandlerOptions,
      generatorStyleOptions,
    )
    css = await appendLegacyContainerCompatCss(
      css,
      rawSource,
      file,
      runtime,
      configuredContainerCompat,
      generated.target,
      styleHandler,
      cssHandlerOptions,
      generatorStyleOptions,
    )
    return {
      css: finalizeMiniProgramGeneratorCss(css, generated.target),
      target: generated.target,
      source: generatorOptions.mode === 'force' ? 'generator-forced' : 'generator',
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
