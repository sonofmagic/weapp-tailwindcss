// webpack 5
import type { Compiler } from 'webpack'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, LinkedJsModuleResult, UserDefinedOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { getCacheKey } from './shared'

const debug = createDebug()

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
      setMangleRuntimeSet,
      runtimeLoaderPath,
      cache,
      twPatcher,
    } = this.options

    if (disabled) {
      return
    }
    twPatcher.patch()
    const { Compilation, sources, NormalModule } = compiler.webpack
    const { ConcatSource } = sources
    function getClassSetInLoader() {
      if (twPatcher.majorVersion !== 4) {
        return twPatcher.getClassSetV3()
      }
    }

    onLoad()
    const loader = runtimeLoaderPath ?? path.resolve(__dirname, './weapp-tw-runtime-loader.js')
    const isExisted = fs.existsSync(loader)
    const WeappTwRuntimeAopLoader = {
      loader,
      options: {
        getClassSet: getClassSetInLoader,
      },
      ident: null,
      type: null,
    }

    // https://github.com/dcloudio/uni-app/blob/dev/packages/webpack-uni-mp-loader/lib/plugin/index-new.js
    // PROCESS_ASSETS_STAGE_ADDITIONAL
    // https://github.com/NervJS/taro/blob/next/packages/taro-webpack5-runner/src/webpack/MiniWebpackPlugin.ts
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (_loaderContext, module) => {
        if (isExisted) {
          const idx = module.loaders.findIndex(x => x.loader.includes('postcss-loader'))
          if (idx > -1) {
            module.loaders.unshift(WeappTwRuntimeAopLoader)
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
          const runtimeSet = await twPatcher.getClassSet()
          setMangleRuntimeSet(runtimeSet)
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
                    const { css } = await styleHandler(rawSource, {
                      isMainChunk: mainCssChunkMatcher(file, this.appType),
                      postcssOptions: {
                        options: {
                          from: file,
                        },
                      },
                      majorVersion: twPatcher.majorVersion,
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
          await Promise.all(tasks)
          debug('end')
          onEnd()
        },
      )
    })
  }
}
