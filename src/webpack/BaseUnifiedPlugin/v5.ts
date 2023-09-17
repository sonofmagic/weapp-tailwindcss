// webpack 5
import path from 'node:path'
import fs from 'node:fs'
import type { Compiler } from 'webpack'
import type { AppType, UserDefinedOptions, InternalUserDefinedOptions, IBaseWebpackPlugin } from '@/types'
import { getOptions } from '@/options'
import { pluginName } from '@/constants'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { getGroupedEntries } from '@/utils'
import { debug } from '@/debug'

/**
 * @name UnifiedWebpackPluginV5
 * @description webpack5 核心转义插件
 * @link https://weapp-tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV5 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    if (options.customReplaceDictionary === undefined) {
      options.customReplaceDictionary = 'simple'
    }
    this.options = getOptions(options)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    const { mainCssChunkMatcher, disabled, onLoad, onUpdate, onEnd, onStart, styleHandler, patch, templateHandler, jsHandler, setMangleRuntimeSet, runtimeLoaderPath, cache } =
      this.options
    if (disabled) {
      return
    }
    patch?.()
    // NormalModule,
    const { Compilation, sources, NormalModule } = compiler.webpack
    const { ConcatSource, RawSource } = sources
    // react
    const twPatcher = createTailwindcssPatcher()
    function getClassSet() {
      return twPatcher.getClassSet()
    }

    onLoad()
    const loader = runtimeLoaderPath ?? path.resolve(__dirname, './weapp-tw-runtime-loader.js')
    const isExisted = fs.existsSync(loader)
    const WeappTwRuntimeAopLoader = {
      loader,
      options: {
        getClassSet
      },
      ident: null,
      type: null
    }

    // https://github.com/dcloudio/uni-app/blob/dev/packages/webpack-uni-mp-loader/lib/plugin/index-new.js
    // PROCESS_ASSETS_STAGE_ADDITIONAL
    // https://github.com/NervJS/taro/blob/next/packages/taro-webpack5-runner/src/webpack/MiniWebpackPlugin.ts
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
        if (isExisted) {
          const idx = module.loaders.findIndex((x) => x.loader.includes('postcss-loader'))
          // // css
          if (idx > -1) {
            module.loaders.unshift(WeappTwRuntimeAopLoader)
          }
        }
      })

      // compilation.hooks.chunkHash.tap(pluginName, (chunk, hash, ctx) => {
      //   console.log(chunk, hash, ctx)
      // })

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        (assets) => {
          onStart()
          debug('processAssets: start')
          // css/mini-extract:
          // '28f380ecd98b2d181c5a'
          // javascript:
          // 'e4e833b622159d58a15d'

          // hash: '9fe3a580c918e8ada4fc651d6484238e'

          // chunk.contentHash.javascript
          // 0:
          // {"moduleB/pages/index" => "e4e833b622159d58a15d"}
          // 1:
          // {"moduleB/comp" => "1680af0b1bb412aa5187"}
          // 2:
          // {"moduleB/custom-wrapper" => "c9da87a25634648d0f2b"}
          // 3:
          // {"moduleB/runtime" => "585baa357d379556aef4"}
          // 4:
          // {"moduleB/vendors" => "090cae713fd0978fa6f3"}

          // chunk.hash
          // 0:
          // {109 => "e23da65bef0a9eb97312ebdee9752b6b"}
          // 1:
          // {642 => "a8ac4f2bbdb0b86b8a73b65bbb53d653"}
          // 2:
          // {644 => "3a5ec990bdf0d2a6f42b0e8bfe0bebec"}
          // 3:
          // {422 => "2f7e84deed01145b2f6190de1c60dfb0"}
          // 4:
          // {730 => "dae6d0a9a1ca336e2b767bf6f8d517e2"}

          // 第一次进来的时候为 init
          for (const chunk of compilation.chunks) {
            if (chunk.id && chunk.hash) {
              if (cache.hashMap.has(chunk.id)) {
                const value = cache.hashMap.get(chunk.id)
                if (value) {
                  // 文件内容没有改变
                  if (chunk.hash === value.hash) {
                    cache.hashMap.set(chunk.id, {
                      // no changed
                      changed: false,
                      hash: chunk.hash
                    })
                  } else {
                    // 改变了，就给新的哈希值
                    cache.hashMap.set(chunk.id, {
                      // new file should be changed
                      changed: true,
                      // new hash
                      hash: chunk.hash
                    })
                  }
                }
              } else {
                cache.hashMap.set(chunk.id, {
                  // new file should be changed
                  changed: true,
                  hash: chunk.hash
                }) // ?? chunk.contentHash.javascript) // or contentHash.javascript) ?
              }
            }
          }
          // console.log(compilation.chunkGraph, compilation.chunks)
          const entries = Object.entries(assets)
          const groupedEntries = getGroupedEntries(entries, this.options)
          // 再次 build 不转化的原因是此时 set.size 为0
          // 也就是说当开启缓存的时候没有触发 postcss,导致 tailwindcss 并没有触发
          const runtimeSet = getClassSet()
          setMangleRuntimeSet(runtimeSet)
          debug('processAssets: runtimeSet inited, class count: %d', runtimeSet.size)

          if (Array.isArray(groupedEntries.html)) {
            for (let i = 0; i < groupedEntries.html.length; i++) {
              const [file, originalSource] = groupedEntries.html[i]

              const rawSource = originalSource.source().toString()

              const wxml = templateHandler(rawSource, {
                runtimeSet
              })
              const source = new ConcatSource(wxml)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, wxml)
            }
            debug('processAssets: html handle finish, count: %s', groupedEntries.html.length)
          }

          if (Array.isArray(groupedEntries.js)) {
            for (let i = 0; i < groupedEntries.js.length; i++) {
              const [file, originalSource] = groupedEntries.js[i]
              const key = file.replace(/\.[^./]+$/, '')
              const hit = cache.hashMap.get(key)
              if (hit && !hit.changed) {
                const source = cache.instance.get(key)
                source && compilation.updateAsset(file, source)
                debug('processAssets: js cache hited: %s', file)
              } else {
                const rawSource = originalSource.source().toString()
                const mapFilename = file + '.map'
                const hasMap = Boolean(assets[mapFilename])
                const { code, map } = jsHandler(rawSource, runtimeSet, {
                  generateMap: hasMap
                })
                const source = new ConcatSource(code)
                compilation.updateAsset(file, source)
                onUpdate(file, rawSource, code)
                debug('processAssets: js handle: %s', file)
                // set cache
                cache.instance.set(key, source)
                if (hasMap && map) {
                  const source = new RawSource(map.toString())
                  compilation.updateAsset(mapFilename, source)
                }
              }
            }
            debug('processAssets: js handler finish, count: %s', groupedEntries.js.length)
          }

          if (Array.isArray(groupedEntries.css)) {
            for (let i = 0; i < groupedEntries.css.length; i++) {
              const [file, originalSource] = groupedEntries.css[i]

              const rawSource = originalSource.source().toString()
              const css = styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(file, this.appType)
              })
              const source = new ConcatSource(css)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, css)
            }
            debug('processAssets: css handler finish, count: %s', groupedEntries.css.length)
          }

          debug('processAssets: end')
          onEnd()
        }
      )
    })
  }
}
