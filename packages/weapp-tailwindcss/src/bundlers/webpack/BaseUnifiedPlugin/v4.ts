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
import { createLoaderAnchorFinders } from '../shared/loader-anchors'
import { installTailwindcssCssRedirect } from '../shared/tailwindcss-css-redirect'
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
    // 保证 options 对象存在，便于后续写入 resolve/module 等。
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
    if (shouldRewriteCssImports) {
      applyTailwindcssCssImportRewrite(compiler, {
        pkgDir: weappTailwindcssPackageDir,
        enabled: true,
        appType: this.appType,
      })
      if (this.appType === 'mpx') {
        installTailwindcssCssRedirect(weappTailwindcssPackageDir)
      }
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
    const cssImportRewriteLoaderOptions = runtimeLoaderRewriteOptions
      ? {
          rewriteCssImports: runtimeLoaderRewriteOptions,
        }
      : undefined
    const { findRewriteAnchor, findClassSetAnchor } = createLoaderAnchorFinders(this.appType)
    const tailwindcssCssEntry = path.join(weappTailwindcssPackageDir, 'index.css')

    onLoad()
    if (shouldRewriteCssImports && this.appType === 'mpx') {
      compiler.options.resolve = compiler.options.resolve || {}
      compiler.options.resolve.alias = compiler.options.resolve.alias || {}
      compiler.options.resolve.alias.tailwindcss = tailwindcssCssEntry
      compiler.options.resolve.alias.tailwindcss$ = tailwindcssCssEntry
    }
    if (runtimeCssImportRewriteLoader && shouldRewriteCssImports && cssImportRewriteLoaderOptions && this.appType === 'mpx') {
      const moduleOptions = (compiler.options.module ??= { rules: [] as any })
      moduleOptions.rules = moduleOptions.rules || []
      const createRule = (match: { test?: RegExp, resourceQuery?: RegExp }) => ({
        ...match,
        enforce: 'pre' as const,
        use: [
          {
            loader: runtimeCssImportRewriteLoader,
            options: cssImportRewriteLoaderOptions,
          },
        ],
      })
      moduleOptions.rules.unshift(
        createRule({ resourceQuery: /type=styles/ }),
        createRule({ test: /\.css$/i }),
      )
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

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.normalModuleLoader.tap(pluginName, (_loaderContext, module: any) => {
        const hasRuntimeLoader = runtimeClassSetLoaderExists || runtimeCssImportRewriteLoaderExists
        if (!hasRuntimeLoader) {
          return
        }
        if (shouldRewriteCssImports && this.appType === 'mpx' && typeof _loaderContext.resolve === 'function') {
          const originalResolve = _loaderContext.resolve
          if (!(originalResolve as any).__weappTwPatched) {
            const wrappedResolve = function (this: any, context: any, request: string, callback: any) {
              if (request === 'tailwindcss' || request === 'tailwindcss$') {
                return callback(null, tailwindcssCssEntry)
              }
              if (request?.startsWith('tailwindcss/')) {
                return callback(null, path.join(weappTailwindcssPackageDir, request.slice('tailwindcss/'.length)))
              }
              return originalResolve.call(this, context, request, callback)
            }
            ;(wrappedResolve as any).__weappTwPatched = true
            _loaderContext.resolve = wrappedResolve as any
          }
        }
        const loaderEntries: Array<{ loader?: string }> = module.loaders || []
        const rewriteAnchorIdx = findRewriteAnchor(loaderEntries)
        const classSetAnchorIdx = findClassSetAnchor(loaderEntries)

        const isCssModule = typeof module.resource === 'string' && this.options.cssMatcher(module.resource)
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

        if (runtimeLoaderRewriteOptions && runtimeCssImportRewriteLoaderExists && cssImportRewriteLoaderOptions) {
          const rewriteEntry = createCssImportRewriteLoaderEntry()
          if (rewriteEntry) {
            // 为了让 rewrite 在执行顺序上先于锚点 loader，需要把它插到
            // 锚点 loader 的后方（数组索引更大，执行时更靠前）。
            if (rewriteAnchorIdx === -1) {
              anchorlessInsert(rewriteEntry, 'after')
            }
            else {
              loaderEntries.splice(rewriteAnchorIdx + 1, 0, rewriteEntry)
            }
          }
        }
        if (runtimeClassSetLoaderExists) {
          const anchorIndex = findClassSetAnchor(loaderEntries)
          if (anchorIndex === -1) {
            anchorlessInsert(createRuntimeClassSetLoaderEntry(), 'before')
          }
          else {
            const insertIndex = anchorIndex === -1 ? rewriteAnchorIdx : anchorIndex
            // 将 class-set 插在锚点 loader 的当前位置（数组索引更小），这样在实际执行顺序里它会排在锚点 loader 之后。
            loaderEntries.splice(insertIndex, 0, createRuntimeClassSetLoaderEntry())
          }
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
