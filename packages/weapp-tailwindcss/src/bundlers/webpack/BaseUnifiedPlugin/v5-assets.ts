import type { Compiler } from 'webpack'
import type { AppType, InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { shouldSkipJsTransform } from '@/js/precheck'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import { generateCssByGenerator } from '../../shared/generator-css'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories } from '../../shared/run-tasks'
import { createAssetHashByChunkMap, createRuntimeAwareCssHash, getCacheKey } from './shared'

interface SetupWebpackV5ProcessAssetsHookOptions {
  compiler: Compiler
  options: InternalUserDefinedOptions
  appType?: AppType
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  getRuntimeRefreshRequirement: () => boolean
  refreshRuntimeMetadata: (force: boolean) => Promise<void>
  consumeRuntimeRefreshRequirement: () => void
  debug: (format: string, ...args: unknown[]) => void
}

export function setupWebpackV5ProcessAssetsHook(options: SetupWebpackV5ProcessAssetsHookOptions) {
  const {
    compiler,
    options: compilerOptions,
    appType,
    runtimeState,
    getRuntimeRefreshRequirement,
    refreshRuntimeMetadata,
    consumeRuntimeRefreshRequirement,
    debug,
  } = options
  const { Compilation, sources } = compiler.webpack
  const { ConcatSource } = sources
  const cssHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    postcssOptions: {
      options: {
        from: string
      }
    }
    majorVersion: number | undefined
  }>()
  const cssUserHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    postcssOptions: {
      options: {
        from: string
      }
    }
    majorVersion: number | undefined
  }>()

  compiler.hooks.compilation.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      },
      async (assets) => {
        compilerOptions.onStart()
        debug('start')
        await runtimeState.readyPromise

        // Initial pass marks cache state.
        for (const chunk of compilation.chunks) {
          if (chunk.id && chunk.hash) {
            compilerOptions.cache.calcHashValueChanged(chunk.id, chunk.hash)
          }
        }
        const assetHashByChunk = createAssetHashByChunkMap(compilation.chunks as any)

        const entries = Object.entries(assets)
        const compilerOutputPath = compilation.compiler?.outputPath ?? compiler.outputPath
        const outputDir = compilerOutputPath
          ? path.resolve(compilerOutputPath)
          : (compilation.outputOptions?.path ?? process.cwd())
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
            const asset = compilation.getAsset(assetName)
            if (!asset) {
              return undefined
            }
            const source = asset.source.source()
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
            const asset = compilation.getAsset(assetName)
            if (!asset) {
              continue
            }
            const previousSource = asset.source.source()
            const previous = typeof previousSource === 'string' ? previousSource : previousSource.toString()
            if (previous === code) {
              continue
            }
            const source = new ConcatSource(code)
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
        const getCssUserHandlerOptions = (file: string) => {
          const majorVersion = runtimeState.twPatcher.majorVersion
          const cacheKey = `${majorVersion ?? 'unknown'}:${file}`
          const cached = cssUserHandlerOptionsCache.get(cacheKey)
          if (cached) {
            return cached
          }

          const created = {
            ...getCssHandlerOptions(file),
            isMainChunk: false,
          }
          cssUserHandlerOptionsCache.set(cacheKey, created)
          return created
        }
        const forceRuntimeRefresh = getRuntimeRefreshRequirement()
        debug('processAssets ensure runtime set forceRefresh=%s major=%s', forceRuntimeRefresh, runtimeState.twPatcher.majorVersion ?? 'unknown')
        const runtimeSet = await ensureRuntimeClassSet(runtimeState, {
          forceRefresh: forceRuntimeRefresh,
          // webpack 的 script-only 热更新可能不会触发 runtime classset loader，
          // 这里强制收集可避免沿用上轮 class set，保证 JS 仅按最新集合精确命中。
          forceCollect: true,
          clearCache: forceRuntimeRefresh,
          allowEmpty: false,
        })
        await refreshRuntimeMetadata(forceRuntimeRefresh)
        consumeRuntimeRefreshRequirement()
        const runtimeSetHash = compilerOptions.cache.computeHash([
          getRuntimeClassSetSignature(runtimeState.twPatcher),
          [...runtimeSet].sort().join('\n'),
        ].join('\n\n'))
        const defaultTemplateHandlerOptions = {
          runtimeSet,
        }
        debug('get runtimeSet, class count: %d', runtimeSet.size)
        const tasks: Promise<void>[] = []
        if (Array.isArray(groupedEntries.html)) {
          for (const element of groupedEntries.html) {
            const [file, originalSource] = element

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
            const asset = compilation.getAsset(file)
            if (!asset) {
              continue
            }
            const absoluteFile = toAbsoluteOutputPath(file, outputDir)
            const initialSource = asset.source.source()
            const initialRawSource = typeof initialSource === 'string' ? initialSource : initialSource.toString()
            const chunkHash = assetHashByChunk.get(file)
            jsTaskFactories.push(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey: `${file}:asset`,
                rawSource: initialRawSource,
                hash: chunkHash,
                applyResult(source) {
                  compilation.updateAsset(file, source)
                },
                onCacheHit() {
                  debug('js cache hit: %s', file)
                },
                transform: async () => {
                  const currentAsset = compilation.getAsset(file)
                  const currentSourceValue = currentAsset?.source.source()
                  const currentSource = typeof currentSourceValue === 'string'
                    ? currentSourceValue
                    : currentSourceValue?.toString() ?? ''
                  const handlerOptions = {
                    tailwindcssMajorVersion: runtimeState.twPatcher.majorVersion,
                    filename: absoluteFile,
                    moduleGraph: moduleGraphOptions,
                    babelParserOptions: {
                      sourceFilename: absoluteFile,
                    },
                  }
                  if (shouldSkipJsTransform(currentSource, handlerOptions)) {
                    return { result: new ConcatSource(currentSource) }
                  }
                  const { code, linked } = await compilerOptions.jsHandler(currentSource, runtimeSet, handlerOptions)
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

            const rawSource = originalSource.source().toString()
            const cacheKey = file
            const chunkHash = assetHashByChunk.get(file)
            const runtimeAwareHash = createRuntimeAwareCssHash(
              chunkHash,
              compilerOptions.cache.computeHash(rawSource),
              runtimeSetHash,
            )
            tasks.push(
              processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey: `${file}:asset`,
                rawSource,
                hash: runtimeAwareHash,
                applyResult(source) {
                  compilation.updateAsset(file, source)
                },
                onCacheHit() {
                  debug('css cache hit: %s', file)
                },
                transform: async () => {
                  await runtimeState.readyPromise
                  const cssHandlerOptions = getCssHandlerOptions(file)
                  const generated = await generateCssByGenerator({
                    opts: compilerOptions,
                    runtimeState,
                    runtime: runtimeSet,
                    rawSource,
                    file,
                    cssHandlerOptions,
                    cssUserHandlerOptions: getCssUserHandlerOptions(file),
                    styleHandler: compilerOptions.styleHandler,
                    debug,
                  })
                  const css = generated?.css ?? (await compilerOptions.styleHandler(rawSource, cssHandlerOptions)).css
                  const source = new ConcatSource(css)

                  compilerOptions.onUpdate(file, rawSource, css)
                  if (generated) {
                    debug('css handle via tailwind v%s engine(%s): %s', runtimeState.twPatcher.majorVersion, generated.target, file)
                  }
                  else {
                    debug('css handle: %s', file)
                  }

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
      },
    )
  })
}
