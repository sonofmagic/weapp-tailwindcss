import type { Compiler } from 'webpack4'
import type { AppType, InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { ConcatSource } from 'webpack-sources'
import { pluginName } from '@/constants'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories } from '../../shared/run-tasks'
import { createAssetHashByChunkMap, getCacheKey } from './shared'

interface SetupWebpackV4EmitHookOptions {
  compiler: Compiler
  options: InternalUserDefinedOptions
  appType?: AppType
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  debug: (format: string, ...args: unknown[]) => void
}

function resolveWebpackStaleClassNameFallback(
  option: InternalUserDefinedOptions['staleClassNameFallback'],
  _compiler: Compiler,
) {
  if (typeof option === 'boolean') {
    return option
  }
  return false
}

export function setupWebpackV4EmitHook(options: SetupWebpackV4EmitHookOptions) {
  const {
    compiler,
    options: compilerOptions,
    appType,
    runtimeState,
    debug,
  } = options
  const cssHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    postcssOptions: {
      options: {
        from: string
      }
    }
    majorVersion: number | undefined
  }>()

  compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
    await runtimeState.patchPromise
    compilerOptions.onStart()
    debug('start')

    // Initial pass marks cache state.
    for (const chunk of compilation.chunks) {
      if (chunk.id && chunk.hash) {
        compilerOptions.cache.calcHashValueChanged(chunk.id, chunk.hash)
      }
    }
    const assetHashByChunk = createAssetHashByChunkMap(compilation.chunks as any)
    const assets = compilation.assets
    const entries = Object.entries(assets)
    const outputDir = compiler.options?.output?.path
      ? path.resolve(compiler.options.output.path)
      : process.cwd()
    const jsAssets = new Map<string, string>()
    for (const [file] of entries) {
      if (compilerOptions.jsMatcher(file) || compilerOptions.wxsMatcher(file)) {
        const absolute = toAbsoluteOutputPath(file, outputDir)
        jsAssets.set(absolute, file)
      }
    }
    const moduleGraphOptions = {
      resolve(specifier: string, importer: string) {
        return resolveOutputSpecifier(specifier, importer, outputDir, candidate => jsAssets.has(candidate))
      },
      load: (id: string) => {
        const assetName = jsAssets.get(id)
        if (!assetName) {
          return undefined
        }
        const assetSource = compilation.assets[assetName]
        if (!assetSource) {
          return undefined
        }
        const source = assetSource.source()
        return typeof source === 'string' ? source : source.toString()
      },
      filter(id: string) {
        return jsAssets.has(id)
      },
    }
    const applyLinkedResults = (linked: Record<string, LinkedJsModuleResult> | undefined) => {
      if (!linked) {
        return
      }
      for (const [id, { code }] of Object.entries(linked)) {
        const assetName = jsAssets.get(id)
        if (!assetName) {
          continue
        }
        const assetSource = compilation.assets[assetName]
        if (!assetSource) {
          continue
        }
        const previousSource = assetSource.source()
        const previous = typeof previousSource === 'string' ? previousSource : previousSource.toString()
        if (previous === code) {
          continue
        }
        const source = new ConcatSource(code)
        // @ts-ignore
        compilation.updateAsset(assetName, source)
        compilerOptions.onUpdate(assetName, previous, code)
        debug('js linked handle: %s', assetName)
      }
    }
    const groupedEntries = getGroupedEntries(entries, compilerOptions)
    const getCssHandlerOptions = (file: string) => {
      const majorVersion = runtimeState.twPatcher.majorVersion
      const isMainChunk = compilerOptions.mainCssChunkMatcher(file, appType)
      const cacheKey = `${majorVersion ?? 'unknown'}:${isMainChunk ? '1' : '0'}:${file}`
      const cached = cssHandlerOptionsCache.get(cacheKey)
      if (cached) {
        return cached
      }

      const created = {
        isMainChunk,
        postcssOptions: {
          options: {
            from: file,
          },
        },
        majorVersion,
      }
      cssHandlerOptionsCache.set(cacheKey, created)
      return created
    }
    const staleClassNameFallback = resolveWebpackStaleClassNameFallback(compilerOptions.staleClassNameFallback, compiler)
    const runtimeSet = await ensureRuntimeClassSet(runtimeState, {
      // webpack 的 script-only 热更新可能不会触发 runtime classset loader，
      // 这里强制收集可避免沿用上轮 class set，保证 JS 仅按最新集合精确命中。
      forceCollect: true,
      allowEmpty: false,
    })
    const defaultTemplateHandlerOptions = {
      runtimeSet,
    }
    debug('get runtimeSet, class count: %d', runtimeSet.size)
    const tasks: Promise<void>[] = []
    if (Array.isArray(groupedEntries.html)) {
      for (const element of groupedEntries.html) {
        const [file, originalSource] = element
        // @ts-ignore
        const rawSource = originalSource.source().toString()

        const cacheKey = file
        const chunkHash = assetHashByChunk.get(file)
        tasks.push(
          processCachedTask({
            cache: compilerOptions.cache,
            cacheKey,
            hashKey: `${file}:asset`,
            rawSource,
            hash: chunkHash,
            applyResult(source) {
              // @ts-ignore
              compilation.updateAsset(file, source)
            },
            onCacheHit() {
              debug('html cache hit: %s', file)
            },
            transform: async () => {
              const wxml = await compilerOptions.templateHandler(rawSource, defaultTemplateHandlerOptions)
              const source = new ConcatSource(wxml)

              compilerOptions.onUpdate(file, rawSource, wxml)
              debug('html handle: %s', file)

              return {
                result: source,
              }
            },
          }),
        )
      }
    }

    const jsTaskFactories: Array<() => Promise<void>> = []

    if (Array.isArray(groupedEntries.js)) {
      for (const [file] of groupedEntries.js) {
        const cacheKey = getCacheKey(file)
        const assetSource = compilation.assets[file]
        if (!assetSource) {
          continue
        }
        const initialValue = assetSource.source()
        const initialRawSource = typeof initialValue === 'string' ? initialValue : initialValue.toString()
        const absoluteFile = toAbsoluteOutputPath(file, outputDir)
        const chunkHash = assetHashByChunk.get(file)
        const sourceAwareHash = chunkHash
          ? `${chunkHash}:${compilerOptions.cache.computeHash(initialRawSource)}`
          : undefined
        jsTaskFactories.push(async () => {
          await processCachedTask({
            cache: compilerOptions.cache,
            cacheKey,
            hashKey: `${file}:asset`,
            rawSource: initialRawSource,
            hash: sourceAwareHash,
            applyResult(source) {
              // @ts-ignore
              compilation.updateAsset(file, source)
            },
            onCacheHit() {
              debug('js cache hit: %s', file)
            },
            transform: async () => {
              const currentAsset = compilation.assets[file]
              const currentValue = currentAsset?.source()
              const currentSource = typeof currentValue === 'string'
                ? currentValue
                : currentValue?.toString() ?? ''
              const { code, linked } = await compilerOptions.jsHandler(currentSource, runtimeSet, {
                staleClassNameFallback,
                tailwindcssMajorVersion: runtimeState.twPatcher.majorVersion,
                filename: absoluteFile,
                moduleGraph: moduleGraphOptions,
                babelParserOptions: {
                  sourceFilename: absoluteFile,
                },
              })
              const source = new ConcatSource(code)
              compilerOptions.onUpdate(file, currentSource, code)
              debug('js handle: %s', file)
              applyLinkedResults(linked)
              return {
                result: source,
              }
            },
          })
        })
      }
    }

    if (Array.isArray(groupedEntries.css)) {
      for (const element of groupedEntries.css) {
        const [file, originalSource] = element
        // @ts-ignore
        const rawSource = originalSource.source().toString()
        const cacheKey = file
        const chunkHash = assetHashByChunk.get(file)
        tasks.push(
          processCachedTask({
            cache: compilerOptions.cache,
            cacheKey,
            hashKey: `${file}:asset`,
            rawSource,
            hash: chunkHash,
            applyResult(source) {
              // @ts-ignore
              compilation.updateAsset(file, source)
            },
            onCacheHit() {
              debug('css cache hit: %s', file)
            },
            transform: async () => {
              await runtimeState.patchPromise
              const { css } = await compilerOptions.styleHandler(rawSource, getCssHandlerOptions(file))
              const source = new ConcatSource(css)

              compilerOptions.onUpdate(file, rawSource, css)
              debug('css handle: %s', file)

              return {
                result: source,
              }
            },
          }),
        )
      }
    }
    pushConcurrentTaskFactories(tasks, jsTaskFactories)

    await Promise.all(tasks)
    debug('end')
    compilerOptions.onEnd()
  })
}
