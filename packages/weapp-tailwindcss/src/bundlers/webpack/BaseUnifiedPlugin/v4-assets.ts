import type { Buffer } from 'node:buffer'
import type { Compiler } from 'webpack4'
import type { AppType, InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { ConcatSource } from 'webpack-sources'
import { pluginName } from '@/constants'
import { shouldSkipJsTransform } from '@/js/precheck'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import { generateCssByGenerator } from '../../shared/generator-css'
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

interface WebpackV4AssetSource {
  source: () => string | Buffer | ArrayBuffer
}

interface WebpackV4AssetCompilation {
  assets: Record<string, WebpackV4AssetSource>
  updateAsset: (file: string, source: WebpackV4AssetSource) => void
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

function toWebpackV4AssetCompilation(compilation: unknown): WebpackV4AssetCompilation {
  return compilation as WebpackV4AssetCompilation
}

function readWebpackV4AssetSource(asset: WebpackV4AssetSource): string {
  const source = asset.source()
  return typeof source === 'string' ? source : source.toString()
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
  const cssUserHandlerOptionsCache = new Map<string, {
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
    const assetCompilation = toWebpackV4AssetCompilation(compilation)
    const assetHashByChunk = createAssetHashByChunkMap(compilation.chunks as any)
    const assets = assetCompilation.assets
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
        const assetSource = assetCompilation.assets[assetName]
        if (!assetSource) {
          return undefined
        }
        return readWebpackV4AssetSource(assetSource)
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
        const assetSource = assetCompilation.assets[assetName]
        if (!assetSource) {
          continue
        }
        const previous = readWebpackV4AssetSource(assetSource)
        if (previous === code) {
          continue
        }
        const source = new ConcatSource(code)
        assetCompilation.updateAsset(assetName, source)
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
        const rawSource = readWebpackV4AssetSource(originalSource)

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
              assetCompilation.updateAsset(file, source)
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
        const assetSource = assetCompilation.assets[file]
        if (!assetSource) {
          continue
        }
        const initialRawSource = readWebpackV4AssetSource(assetSource)
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
              assetCompilation.updateAsset(file, source)
            },
            onCacheHit() {
              debug('js cache hit: %s', file)
            },
            transform: async () => {
              const currentAsset = assetCompilation.assets[file]
              const currentSource = currentAsset ? readWebpackV4AssetSource(currentAsset) : ''
              const handlerOptions = {
                staleClassNameFallback,
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
        const rawSource = readWebpackV4AssetSource(originalSource)
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
              assetCompilation.updateAsset(file, source)
            },
            onCacheHit() {
              debug('css cache hit: %s', file)
            },
            transform: async () => {
              await runtimeState.patchPromise
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
  })
}
