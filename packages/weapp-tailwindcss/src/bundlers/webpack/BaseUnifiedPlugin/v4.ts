// webpack 4

import type { Compiler } from 'webpack4'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, UserDefinedOptions } from '../../../types'
import fs from 'node:fs'
import path from 'node:path'
import { ConcatSource, RawSource } from 'webpack-sources'
import { pluginName } from '../../../constants'
import { createDebug } from '../../../debug'
import { getOptions } from '../../../options'
import { getGroupedEntries, removeExt } from '../../../utils'

const debug = createDebug()

/**
 * @name UnifiedWebpackPluginV4
 * @description webpack4 核心转义插件
 * @link https://tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV4 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    this.options = getOptions(options)
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
      patch,
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
    patch?.()

    function getClassSet() {
      return twPatcher.getClassSet()
    }

    onLoad()
    const loader = runtimeLoaderPath ?? path.resolve(__dirname, './weapp-tw-runtime-loader.js')
    const isExisted = fs.existsSync(loader)
    const WeappTwRuntimeAopLoader = {
      loader,
      options: {
        getClassSet,
      },
      ident: null,
      type: null,
    }

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.normalModuleLoader.tap(pluginName, (_loaderContext, module) => {
        if (isExisted) {
          const idx = module.loaders.findIndex(x => x.loader.includes('postcss-loader'))

          if (idx > -1) {
            module.loaders.unshift(WeappTwRuntimeAopLoader)
          }
        }
      })
    })

    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
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
      const groupedEntries = getGroupedEntries(entries, this.options)
      // 再次 build 不转化的原因是此时 set.size 为0
      // 也就是说当开启缓存的时候没有触发 postcss,导致 tailwindcss 并没有触发
      const runtimeSet = getClassSet()
      setMangleRuntimeSet(runtimeSet)
      debug('get runtimeSet, class count: %d', runtimeSet.size)

      if (Array.isArray(groupedEntries.html)) {
        let noCachedCount = 0
        for (let i = 0; i < groupedEntries.html.length; i++) {
          const [file, originalSource] = groupedEntries.html[i]

          const rawSource = originalSource.source().toString()

          const hash = cache.computeHash(rawSource)
          const cacheKey = file
          cache.calcHashValueChanged(cacheKey, hash)
          await cache.process(
            cacheKey,
            () => {
              const source = cache.get(cacheKey)
              if (source) {
                compilation.updateAsset(file, source)
                debug('html cache hit: %s', file)
              }
              else {
                return false
              }
            },
            // @ts-ignore
            async () => {
              const wxml = await templateHandler(rawSource, {
                runtimeSet,
              })
              const source = new ConcatSource(wxml)
              // @ts-ignore
              compilation.updateAsset(file, source)

              onUpdate(file, rawSource, wxml)
              debug('html handle: %s', file)
              noCachedCount++
              return {
                key: cacheKey,
                source,
              }
            },
          )
        }
        debug('html handle finish, total: %d, no-cached: %d', groupedEntries.html.length, noCachedCount)
      }

      if (Array.isArray(groupedEntries.js)) {
        let noCachedCount = 0
        for (let i = 0; i < groupedEntries.js.length; i++) {
          const [file, originalSource] = groupedEntries.js[i]
          const cacheKey = removeExt(file)

          await cache.process(
            cacheKey,
            () => {
              const source = cache.get(cacheKey)
              if (source) {
                compilation.updateAsset(file, source)
                debug('js cache hit: %s', file)
              }
              else {
                return false
              }
            },
            // @ts-ignore
            async () => {
              const rawSource = originalSource.source().toString()
              const mapFilename = `${file}.map`
              const hasMap = Boolean(assets[mapFilename])
              const { code, map } = await jsHandler(rawSource, runtimeSet, {
                generateMap: hasMap,
              })
              const source = new ConcatSource(code)
              // @ts-ignore
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, code)
              debug('js handle: %s', file)
              noCachedCount++

              if (hasMap && map) {
                const source = new RawSource(map.toString())
                // @ts-ignore
                compilation.updateAsset(mapFilename, source)
              }
              return {
                key: cacheKey,
                source,
              }
            },
          )
        }
        debug('js handle finish, total: %d, no-cached: %d', groupedEntries.js.length, noCachedCount)
      }

      if (Array.isArray(groupedEntries.css)) {
        let noCachedCount = 0
        for (let i = 0; i < groupedEntries.css.length; i++) {
          const [file, originalSource] = groupedEntries.css[i]
          const rawSource = originalSource.source().toString()
          const hash = cache.computeHash(rawSource)
          const cacheKey = file
          cache.calcHashValueChanged(cacheKey, hash)

          await cache.process(
            cacheKey,
            () => {
              const source = cache.get(cacheKey)
              if (source) {
                compilation.updateAsset(file, source)
                debug('css cache hit: %s', file)
              }
              else {
                return false
              }
            },
            // @ts-ignore
            async () => {
              const { css } = await styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(file, this.appType),
              })
              const source = new ConcatSource(css)
              // @ts-ignore
              compilation.updateAsset(file, source)

              onUpdate(file, rawSource, css)
              debug('css handle: %s', file)
              noCachedCount++
              return {
                key: cacheKey,
                source,
              }
            },
          )
        }
        debug('css handle finish, total: %d, no-cached: %d', groupedEntries.css.length, noCachedCount)
      }

      debug('end')
      onEnd()
    })
  }
}
