// webpack 4
import type { Compiler } from 'webpack4'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, LinkedJsModuleResult, UserDefinedOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { ConcatSource } from 'webpack-sources'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { collectRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { getGroupedEntries } from '@/utils'
import { resolvePackageDir } from '@/utils/resolve-package'
import { processCachedTask } from '../../shared/cache'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories } from '../../shared/run-tasks'
import { applyTailwindcssCssImportRewrite } from '../shared/css-imports'
import { getCacheKey } from './shared'

const debug = createDebug()
export const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')

/**
 * @name UnifiedWebpackPluginV4
 * @description webpack4 核心转义插件
 * @link https://tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV4 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    this.options = getCompilerContext(options)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    const {
      mainCssChunkMatcher,
      disabled,
      onLoad,
      onUpdate,
      onEnd,
      onStart,
      styleHandler,
      templateHandler,
      jsHandler,
      runtimeLoaderPath,
      runtimeCssImportRewriteLoaderPath,
      cache,
      twPatcher: initialTwPatcher,
      refreshTailwindcssPatcher,
    } = this.options

    if (disabled) {
      return
    }
    const isTailwindcssV4 = (initialTwPatcher.majorVersion ?? 0) >= 4
    const shouldRewriteCssImports = isTailwindcssV4 && this.options.rewriteCssImports !== false
    if (shouldRewriteCssImports) {
      applyTailwindcssCssImportRewrite(compiler, {
        pkgDir: weappTailwindcssPackageDir,
        enabled: true,
      })
    }
    const patchRecorderState = setupPatchRecorder(initialTwPatcher, this.options.tailwindcssBasedir, {
      source: 'runtime',
      cwd: this.options.tailwindcssBasedir ?? process.cwd(),
    })
    const runtimeState = {
      twPatcher: initialTwPatcher,
      patchPromise: patchRecorderState.patchPromise,
      refreshTailwindcssPatcher,
      onPatchCompleted: patchRecorderState.onPatchCompleted,
    }

    const refreshRuntimeState = async (force: boolean) => {
      await refreshTailwindRuntimeState(runtimeState, force)
    }

    async function getClassSetInLoader() {
      await refreshRuntimeState(true)
      await runtimeState.patchPromise
      await collectRuntimeClassSet(runtimeState.twPatcher, { force: true, skipRefresh: true })
    }

    onLoad()
    const runtimeClassSetLoader = runtimeLoaderPath
      ?? path.resolve(__dirname, './weapp-tw-runtime-classset-loader.js')
    const runtimeCssImportRewriteLoader = shouldRewriteCssImports
      ? (runtimeCssImportRewriteLoaderPath
        ?? path.resolve(__dirname, './weapp-tw-css-import-rewrite-loader.js'))
      : undefined
    const runtimeClassSetLoaderExists = fs.existsSync(runtimeClassSetLoader)
    const runtimeCssImportRewriteLoaderExists = runtimeCssImportRewriteLoader
      ? fs.existsSync(runtimeCssImportRewriteLoader)
      : false
    const runtimeLoaderRewriteOptions = shouldRewriteCssImports
      ? {
          pkgDir: weappTailwindcssPackageDir,
        }
      : undefined
    const classSetLoaderOptions = {
      getClassSet: getClassSetInLoader,
    }
    const cssImportRewriteLoaderOptions = runtimeLoaderRewriteOptions
      ? {
          rewriteCssImports: runtimeLoaderRewriteOptions,
        }
      : undefined
    const createRuntimeClassSetLoaderEntry = () => ({
      loader: runtimeClassSetLoader,
      options: classSetLoaderOptions,
      ident: null,
      type: null,
    })
    const createCssImportRewriteLoaderEntry = () => {
      if (!runtimeCssImportRewriteLoader) {
        return null
      }
      return {
        loader: runtimeCssImportRewriteLoader,
        options: cssImportRewriteLoaderOptions,
        ident: null,
        type: null,
      }
    }

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.normalModuleLoader.tap(pluginName, (_loaderContext, module) => {
        const hasRuntimeLoader = runtimeClassSetLoaderExists || runtimeCssImportRewriteLoaderExists
        if (!hasRuntimeLoader) {
          return
        }
        // @ts-ignore
        const loaderEntries = module.loaders || []
        const idx = loaderEntries.findIndex((entry: any) => {
          if (!entry?.loader) {
            return false
          }
          return entry.loader.includes('postcss-loader')
        })

        if (idx === -1) {
          return
        }

        if (runtimeLoaderRewriteOptions && runtimeCssImportRewriteLoaderExists && cssImportRewriteLoaderOptions) {
          const rewriteEntry = createCssImportRewriteLoaderEntry()
          if (rewriteEntry) {
            // 为了让 rewrite 在执行顺序上先于 postcss-loader，需要把它插到
            // postcss-loader 的后方（数组索引更大，执行时更靠前）。
            // @ts-ignore
            loaderEntries.splice(idx + 1, 0, rewriteEntry)
          }
        }
        if (runtimeClassSetLoaderExists) {
          const postcssIndex = loaderEntries.findIndex((entry: any) => entry?.loader?.includes?.('postcss-loader'))
          const insertIndex = postcssIndex === -1 ? idx : postcssIndex
          // 将 class-set 插在 postcss-loader 的当前位置（数组索引更小），这样在实际执行顺序里它会排在 postcss-loader 之后。
          // @ts-ignore
          loaderEntries.splice(insertIndex, 0, createRuntimeClassSetLoaderEntry())
        }
      })
    })

    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      await runtimeState.patchPromise
      onStart()
      debug('start')

      // 第一次进来的时候为 init
      for (const chunk of compilation.chunks) {
        if (chunk.id && chunk.hash) {
          cache.calcHashValueChanged(chunk.id, chunk.hash)
        }
      }
      const assets = compilation.assets
      const entries = Object.entries(assets)
      const outputDir = compiler.options?.output?.path
        ? path.resolve(compiler.options.output.path)
        : process.cwd()
      const jsAssets = new Map<string, string>()
      for (const [file] of entries) {
        if (this.options.jsMatcher(file) || this.options.wxsMatcher(file)) {
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
          onUpdate(assetName, previous, code)
          debug('js linked handle: %s', assetName)
        }
      }
      const groupedEntries = getGroupedEntries(entries, this.options)
      // 再次 build 不转化的原因是此时 set.size 为0
      // 也就是说当开启缓存的时候没有触发 postcss,导致 tailwindcss 并没有触发
      await refreshRuntimeState(true)
      await runtimeState.patchPromise
      const runtimeSet = await collectRuntimeClassSet(runtimeState.twPatcher, { force: true, skipRefresh: true })
      debug('get runtimeSet, class count: %d', runtimeSet.size)
      const tasks: Promise<void>[] = []
      if (Array.isArray(groupedEntries.html)) {
        for (const element of groupedEntries.html) {
          const [file, originalSource] = element
          // @ts-ignore
          const rawSource = originalSource.source().toString()

          const cacheKey = file
          tasks.push(
            processCachedTask({
              cache,
              cacheKey,
              rawSource,
              applyResult(source) {
                // @ts-ignore
                compilation.updateAsset(file, source)
              },
              onCacheHit() {
                debug('html cache hit: %s', file)
              },
              transform: async () => {
                const wxml = await templateHandler(rawSource, {
                  runtimeSet,
                })
                const source = new ConcatSource(wxml)

                onUpdate(file, rawSource, wxml)
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
          jsTaskFactories.push(async () => {
            await processCachedTask({
              cache,
              cacheKey,
              rawSource: initialRawSource,
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
                const { code, linked } = await jsHandler(currentSource, runtimeSet, {
                  filename: absoluteFile,
                  moduleGraph: moduleGraphOptions,
                  babelParserOptions: {
                    sourceFilename: absoluteFile,
                  },
                })
                const source = new ConcatSource(code)
                onUpdate(file, currentSource, code)
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
          tasks.push(
            processCachedTask({
              cache,
              cacheKey,
              rawSource,
              applyResult(source) {
                // @ts-ignore
                compilation.updateAsset(file, source)
              },
              onCacheHit() {
                debug('css cache hit: %s', file)
              },
              transform: async () => {
                await runtimeState.patchPromise
                const { css } = await styleHandler(rawSource, {
                  isMainChunk: mainCssChunkMatcher(file, this.appType),
                  postcssOptions: {
                    options: {
                      from: file,
                    },
                  },
                  majorVersion: runtimeState.twPatcher.majorVersion,
                })
                const source = new ConcatSource(css)

                onUpdate(file, rawSource, css)
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
      onEnd()
    })
  }
}
