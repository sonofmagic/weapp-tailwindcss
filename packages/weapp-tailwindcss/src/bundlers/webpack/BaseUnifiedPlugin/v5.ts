// webpack 5
import type { Compiler } from 'webpack'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, LinkedJsModuleResult, UserDefinedOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { ensureMpxTailwindcssAliases, injectMpxCssRewritePreRules, isMpx, patchMpxLoaderResolve, setupMpxTailwindcssRedirect } from '@/shared/mpx'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { collectRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { getGroupedEntries } from '@/utils'
import { resolvePackageDir } from '@/utils/resolve-package'
import { processCachedTask } from '../../shared/cache'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories } from '../../shared/run-tasks'
import { applyTailwindcssCssImportRewrite } from '../shared/css-imports'
import { createLoaderAnchorFinders } from '../shared/loader-anchors'
import { getCacheKey, hasLoaderEntry, isCssLikeModuleResource } from './shared'

const debug = createDebug()
export const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')

/**
 * @name UnifiedWebpackPluginV5
 * @description webpack5 核心转义插件
 * @link https://tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV5 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    this.options = getCompilerContext(options)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    compiler.options = compiler.options || {} as any
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
    const isMpxApp = isMpx(this.appType)
    if (shouldRewriteCssImports) {
      applyTailwindcssCssImportRewrite(compiler, {
        pkgDir: weappTailwindcssPackageDir,
        enabled: true,
        appType: this.appType,
      })
      setupMpxTailwindcssRedirect(weappTailwindcssPackageDir, isMpxApp)
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
    const { Compilation, sources, NormalModule } = compiler.webpack
    const { ConcatSource } = sources
    async function getClassSetInLoader() {
      await refreshRuntimeState(true)
      await runtimeState.patchPromise
      await collectRuntimeClassSet(runtimeState.twPatcher, { force: true, skipRefresh: true })
    }

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
          appType: this.appType,
        }
      : undefined
    const classSetLoaderOptions = {
      getClassSet: getClassSetInLoader,
    }
    const { findRewriteAnchor, findClassSetAnchor } = createLoaderAnchorFinders(this.appType)
    const cssImportRewriteLoaderOptions = runtimeLoaderRewriteOptions
      ? {
          rewriteCssImports: runtimeLoaderRewriteOptions,
        }
      : undefined

    onLoad()
    if (shouldRewriteCssImports && isMpxApp) {
      ensureMpxTailwindcssAliases(compiler, weappTailwindcssPackageDir)
    }
    if (runtimeCssImportRewriteLoader && shouldRewriteCssImports && cssImportRewriteLoaderOptions && isMpxApp) {
      // Ensure CSS files（如 app.css）在进入 postcss-import 前先被重写。
      injectMpxCssRewritePreRules(compiler, runtimeCssImportRewriteLoader, cssImportRewriteLoaderOptions)
    }
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

    // https://github.com/dcloudio/uni-app/blob/dev/packages/webpack-uni-mp-loader/lib/plugin/index-new.js
    // PROCESS_ASSETS_STAGE_ADDITIONAL
    // https://github.com/NervJS/taro/blob/next/packages/taro-webpack5-runner/src/webpack/MiniWebpackPlugin.ts
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (_loaderContext, module) => {
        const hasRuntimeLoader = runtimeClassSetLoaderExists || runtimeCssImportRewriteLoaderExists
        if (!hasRuntimeLoader) {
          return
        }
        patchMpxLoaderResolve(_loaderContext, weappTailwindcssPackageDir, shouldRewriteCssImports && isMpxApp)
        const loaderEntries = module.loaders || []
        let rewriteAnchorIdx = findRewriteAnchor(loaderEntries)
        const classSetAnchorIdx = findClassSetAnchor(loaderEntries)
        const isCssModule = isCssLikeModuleResource(module.resource, this.options.cssMatcher, this.appType)
        if (process.env.WEAPP_TW_LOADER_DEBUG && isCssModule) {
          debug('loader hook css module: %s loaders=%o anchors=%o', module.resource, loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
        }
        if (process.env.WEAPP_TW_LOADER_DEBUG && typeof module.resource === 'string' && module.resource.includes('app.css')) {
          debug('app.css module loaders=%o anchors=%o', loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
        }
        else if (process.env.WEAPP_TW_LOADER_DEBUG && typeof module.resource === 'string' && module.resource.endsWith('.css')) {
          debug('css module seen: %s loaders=%o anchors=%o', module.resource, loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
        }
        if (rewriteAnchorIdx === -1 && classSetAnchorIdx === -1 && !isCssModule) {
          return
        }
        const anchorlessInsert = (entry: any, position: 'before' | 'after') => {
          if (position === 'after') {
            loaderEntries.push(entry)
          }
          else {
            loaderEntries.unshift(entry)
          }
        }
        if (
          cssImportRewriteLoaderOptions
          && runtimeCssImportRewriteLoaderExists
          && runtimeCssImportRewriteLoader
        ) {
          const existingIndex = loaderEntries.findIndex(entry => entry.loader?.includes?.(runtimeCssImportRewriteLoader))
          const rewriteLoaderEntry = existingIndex !== -1
            ? loaderEntries.splice(existingIndex, 1)[0]
            : createCssImportRewriteLoaderEntry()
          if (rewriteLoaderEntry) {
            // 让 rewrite 处于锚点 loader 之后（数组索引更大），这样执行时会排在锚点 loader 之前。
            const anchorIndex = findRewriteAnchor(loaderEntries)
            if (anchorIndex === -1) {
              anchorlessInsert(rewriteLoaderEntry, 'after')
            }
            else {
              loaderEntries.splice(anchorIndex + 1, 0, rewriteLoaderEntry)
            }
            rewriteAnchorIdx = findRewriteAnchor(loaderEntries)
          }
        }
        if (runtimeClassSetLoaderExists && !hasLoaderEntry(loaderEntries, runtimeClassSetLoader)) {
          const classSetLoaderEntry = createRuntimeClassSetLoaderEntry()
          const anchorIndex = findClassSetAnchor(loaderEntries)
          if (anchorIndex === -1) {
            anchorlessInsert(classSetLoaderEntry, 'before')
          }
          else {
            const insertIndex = anchorIndex === -1 ? rewriteAnchorIdx : anchorIndex
            loaderEntries.splice(insertIndex, 0, classSetLoaderEntry)
          }
        }
      })

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async (assets) => {
          onStart()
          debug('start')
          await runtimeState.patchPromise

          // 第一次进来的时候为 init
          for (const chunk of compilation.chunks) {
            if (chunk.id && chunk.hash) {
              cache.calcHashValueChanged(chunk.id, chunk.hash)
            }
          }

          const entries = Object.entries(assets)
          const compilerOutputPath = compilation.compiler?.outputPath ?? compiler.outputPath
          const outputDir = compilerOutputPath
            ? path.resolve(compilerOutputPath)
            : (compilation.outputOptions?.path ?? process.cwd())
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

              const rawSource = originalSource.source().toString()

              const cacheKey = file
              tasks.push(
                processCachedTask({
                  cache,
                  cacheKey,
                  rawSource,
                  applyResult(source) {
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
              const asset = compilation.getAsset(file)
              if (!asset) {
                continue
              }
              const absoluteFile = toAbsoluteOutputPath(file, outputDir)
              const initialSource = asset.source.source()
              const initialRawSource = typeof initialSource === 'string' ? initialSource : initialSource.toString()
              jsTaskFactories.push(async () => {
                await processCachedTask({
                  cache,
                  cacheKey,
                  rawSource: initialRawSource,
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

              const rawSource = originalSource.source().toString()
              const cacheKey = file
              tasks.push(
                processCachedTask({
                  cache,
                  cacheKey,
                  rawSource,
                  applyResult(source) {
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
        },
      )
    })
  }
}
