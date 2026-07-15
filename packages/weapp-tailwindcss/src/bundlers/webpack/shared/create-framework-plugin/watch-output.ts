import type { Compiler } from 'webpack'
import path from 'node:path'
import micromatch from 'micromatch'
import { pluginName } from '@/constants'
import { createDebug } from '@/debug'
import { resolvePackageDir } from '@/utils/resolve-package'

export const debug = createDebug()
export const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')

type WebpackWatchOptions = NonNullable<Parameters<Compiler['watch']>[0]>
type WebpackWatchIgnoredItem = string | RegExp | ((file: string) => boolean)
const outputIgnoredPredicatePath = Symbol('weapp-tailwindcss.outputIgnoredPredicatePath')

type OutputIgnoredPredicate = ((file: string) => boolean) & {
  [outputIgnoredPredicatePath]?: string
}

export function shouldKeepPreviousWebpackCssSource(
  previous: { css: string | undefined, processed?: boolean | undefined },
  next: { css: string | undefined, processed?: boolean | undefined },
) {
  return next.processed === true && previous.processed === false
}

function normalizeIgnoredList(ignored: WebpackWatchOptions['ignored']): WebpackWatchIgnoredItem[] {
  const items: unknown[] = Array.isArray(ignored) ? [...ignored] : [ignored]
  return items.filter((item): item is WebpackWatchIgnoredItem =>
    typeof item === 'string' || item instanceof RegExp || typeof item === 'function',
  )
}

function createOutputIgnoredPredicate(
  ignoredList: WebpackWatchIgnoredItem[],
  ignoredPath: string,
) {
  const predicate: OutputIgnoredPredicate = (file: string) => {
    const resolvedFile = path.resolve(file)
    if (resolvedFile === ignoredPath || resolvedFile.startsWith(`${ignoredPath}${path.sep}`)) {
      return true
    }

    const normalizedFile = file.replace(/\\/g, '/')
    return ignoredList.some((item) => {
      if (typeof item === 'string') {
        const resolvedItem = path.resolve(item)
        if (resolvedFile === resolvedItem || resolvedFile.startsWith(`${resolvedItem}${path.sep}`)) {
          return true
        }
        return micromatch.isMatch(normalizedFile, item)
      }
      if (item instanceof RegExp) {
        return item.test(normalizedFile)
      }
      return item(file)
    })
  }
  predicate[outputIgnoredPredicatePath] = ignoredPath
  return predicate
}

function appendIgnoredPath(ignored: WebpackWatchOptions['ignored'], ignoredPath: string) {
  if (
    typeof ignored === 'function'
    && (ignored as OutputIgnoredPredicate)[outputIgnoredPredicatePath] === ignoredPath
  ) {
    return ignored
  }

  const ignoredList = normalizeIgnoredList(ignored)
  const hasNonStringIgnoredRule = ignoredList.some(item => typeof item !== 'string')
  if (hasNonStringIgnoredRule) {
    return createOutputIgnoredPredicate(ignoredList, ignoredPath)
  }

  if (ignoredList.some(item => typeof item === 'string' && path.resolve(item) === ignoredPath)) {
    return ignored
  }
  return [...ignoredList, ignoredPath]
}

export function setupWebpackWatchOutputIgnore(compiler: Compiler) {
  const appendOutputIgnoredPath = (watchOptions?: WebpackWatchOptions, outputPath?: string) => {
    const resolvedOutputPath = outputPath || compiler.outputPath || compiler.options?.output?.path
    const outputDir = resolvedOutputPath ? path.resolve(resolvedOutputPath) : undefined
    if (!outputDir) {
      return watchOptions
    }

    if (watchOptions && typeof watchOptions === 'object') {
      const nextIgnored = appendIgnoredPath(watchOptions.ignored, outputDir)
      if (nextIgnored === undefined) {
        delete watchOptions.ignored
      }
      else {
        watchOptions.ignored = nextIgnored as NonNullable<WebpackWatchOptions['ignored']>
      }
      return watchOptions
    }

    return { ignored: appendIgnoredPath(undefined, outputDir) } as WebpackWatchOptions
  }

  const compilerWatchOptions = appendOutputIgnoredPath(compiler.options.watchOptions)
  if (compilerWatchOptions) {
    compiler.options.watchOptions = compilerWatchOptions
  }

  const syncOutputIgnoredPath = () => {
    const outputPath = compiler.outputPath || compiler.options?.output?.path
    const watchOptions = (compiler.watching as { watchOptions?: WebpackWatchOptions } | undefined)?.watchOptions
    if (watchOptions) {
      appendOutputIgnoredPath(watchOptions, outputPath)
    }
  }

  compiler.hooks.watchRun?.tap(pluginName, syncOutputIgnoredPath)
  compiler.hooks.thisCompilation?.tap(pluginName, (compilation) => {
    const outputPath = compilation.compiler?.outputPath || compilation.outputOptions?.path
    const watchOptions = (compiler.watching as { watchOptions?: WebpackWatchOptions } | undefined)?.watchOptions
    if (watchOptions) {
      appendOutputIgnoredPath(watchOptions, outputPath)
    }
    else {
      const compilerWatchOptions = appendOutputIgnoredPath(compiler.options.watchOptions, outputPath)
      if (compilerWatchOptions) {
        compiler.options.watchOptions = compilerWatchOptions
      }
    }
  })
}
