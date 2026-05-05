import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import postcss from 'postcss'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV4SourceFromPatcher,
} from '@/generator'

const TAILWIND_V4_BANNER_RE = /\/\*!\s*tailwindcss v4\./
const TAILWIND_GENERATED_CSS_MARKER_RE = /\/\*!\s*tailwindcss v|@property\s+--tw-|--tw-|:not\(#\\#\)|\.[^,{]*\\:/
const TAILWIND_BANNER_PREFIX_RE = /^\/\*!\s*tailwindcss v[^*]*\*\/\s*/i
const TAILWIND_BANNER_RE = /\/\*!\s*tailwindcss v[^*]*\*\//i
const VITE_MARKER_RE = /\/\*\$vite\$:[^*]*\*\//g
const SUPPORTED_GENERATOR_MAJOR_VERSIONS = new Set([3, 4])
const REMOTE_IMPORT_RE = /^(?:https?:)?\/\//i

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

export function hasTailwindGeneratedCss(rawSource: string) {
  return TAILWIND_V4_BANNER_RE.test(rawSource)
}

export function hasTailwindGeneratedCssMarkers(rawSource: string) {
  return TAILWIND_GENERATED_CSS_MARKER_RE.test(rawSource)
}

function parseImportRequest(params: string) {
  const match = /^(?:url\(\s*)?(["']?)([^"')\s]+)\1\s*\)?/.exec(params.trim())
  return match?.[2]
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

  if (
    generatorOptions.mode === 'off'
    || !SUPPORTED_GENERATOR_MAJOR_VERSIONS.has(majorVersion ?? 0)
    || (
      generatorOptions.mode !== 'force'
      && majorVersion !== 3
      && !hasTailwindGeneratedCss(rawSource)
    )
    || (
      !cssHandlerOptions.isMainChunk
      && majorVersion !== 3
      && !hasTailwindGeneratedCss(rawSource)
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
        if (generated.target === 'weapp') {
          const { css: userCss } = await styleHandler(extraCss, {
            ...cssUserHandlerOptions,
            ...generatorOptions.styleOptions,
          })
          css = createCssAppend(css, userCss)
        }
        else {
          css = createCssAppend(css, extraCss)
        }
      }
      return {
        css,
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
      const cleanedRawSource = removeTailwindGeneratedCssByBanner(rawSource)
      if (cleanedRawSource === undefined) {
        return {
          css,
          target: generated.target,
          source: 'generator-forced',
        }
      }
      if (generated.target === 'weapp') {
        const { css: userCss } = await styleHandler(cleanedRawSource, {
          ...cssUserHandlerOptions,
          ...generatorOptions.styleOptions,
        })
        css = createCssAppend(css, userCss)
      }
      else {
        css = createCssAppend(css, cleanedRawSource)
      }
      return {
        css,
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
