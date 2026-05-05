import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV4SourceFromPatcher,
} from '@/generator'

const TAILWIND_V4_BANNER_RE = /\/\*!\s*tailwindcss v4\./
const TAILWIND_BANNER_PREFIX_RE = /^\/\*!\s*tailwindcss v[^*]*\*\/\s*/i
const SUPPORTED_GENERATOR_MAJOR_VERSIONS = new Set([3, 4])

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
  if (start === -1 || rawSource.slice(0, start).trim().length > 0) {
    return
  }

  return rawSource.slice(start + rawTailwindCss.length)
}

export function stripTailwindBanner(css: string) {
  return css.replace(TAILWIND_BANNER_PREFIX_RE, '')
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

  if (
    generatorOptions.mode === 'off'
    || !SUPPORTED_GENERATOR_MAJOR_VERSIONS.has(majorVersion ?? 0)
    || !cssHandlerOptions.isMainChunk
    || (
      generatorOptions.mode !== 'force'
      && majorVersion !== 3
      && !TAILWIND_V4_BANNER_RE.test(rawSource)
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
        'tailwind direct css generation prefix mismatch, use generator css as source of truth %s',
        file,
      )
      return {
        css: stripTailwindBanner(generated.css),
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
