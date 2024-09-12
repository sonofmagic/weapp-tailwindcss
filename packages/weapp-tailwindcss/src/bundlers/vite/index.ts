import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin } from 'vite'
import type { UserDefinedOptions } from '../../types'
import { vitePluginName } from '../../constants'
import { createDebug } from '../../debug'
import { getOptions } from '../../options'
import { getGroupedEntries } from '../../utils'

const debug = createDebug()

/**
 * @name UnifiedViteWeappTailwindcssPlugin
 * @description uni-app vite vue3 版本插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function UnifiedViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin | undefined {
  const opts = getOptions(options)
  const {
    disabled,
    onEnd,
    onLoad,
    onStart,
    onUpdate,
    templateHandler,
    styleHandler,
    patch,
    jsHandler,
    mainCssChunkMatcher,
    appType,
    setMangleRuntimeSet,
    cache,
    twPatcher,
  } = opts
  if (disabled) {
    return
  }

  patch?.()

  onLoad()
  // 要在 vite:css 处理之前运行
  return {
    name: vitePluginName,
    enforce: 'post',
    async generateBundle(_opt, bundle) {
      debug('start')
      onStart()

      const entries = Object.entries(bundle)
      const groupedEntries = getGroupedEntries(entries, opts)
      const runtimeSet = twPatcher.getClassSet()
      setMangleRuntimeSet(runtimeSet)
      debug('get runtimeSet, class count: %d', runtimeSet.size)
      if (Array.isArray(groupedEntries.html)) {
        let noCachedCount = 0
        for (let i = 0; i < groupedEntries.html.length; i++) {
          const [file, originalSource] = groupedEntries.html[i] as [string, OutputAsset]

          const oldVal = originalSource.source.toString()

          const hash = cache.computeHash(oldVal)
          cache.calcHashValueChanged(file, hash)

          await cache.process(
            file,
            () => {
              const source = cache.get<string>(file)
              if (source) {
                originalSource.source = source
                debug('html cache hit: %s', file)
              }
              else {
                return false
              }
            },
            async () => {
              originalSource.source = await templateHandler(oldVal, {
                runtimeSet,
              })
              onUpdate(file, oldVal, originalSource.source)
              debug('html handle: %s', file)
              noCachedCount++
              return {
                key: file,
                source: originalSource.source,
              }
            },
          )
        }
        debug('html handle finish, total: %d, no-cached: %d', groupedEntries.html.length, noCachedCount)
      }
      if (Array.isArray(groupedEntries.js)) {
        let noCachedCount = 0
        for (let i = 0; i < groupedEntries.js.length; i++) {
          const [file, originalSource] = groupedEntries.js[i] as [string, OutputChunk]
          const rawSource = originalSource.code

          const hash = cache.computeHash(rawSource)
          cache.calcHashValueChanged(file, hash)
          await cache.process(
            file,
            () => {
              const source = cache.get<string>(file)
              if (source) {
                originalSource.code = source
                debug('js cache hit: %s', file)
              }
              else {
                return false
              }
            },
            async () => {
              const mapFilename = `${file}.map`
              const hasMap = Boolean(bundle[mapFilename])
              const { code, map } = await jsHandler(rawSource, runtimeSet, {
                generateMap: hasMap,
              })
              originalSource.code = code
              onUpdate(file, rawSource, code)
              debug('js handle: %s', file)
              noCachedCount++
              if (hasMap && map) {
                ;(bundle[mapFilename] as OutputAsset).source = map.toString()
              }
              return {
                key: file,
                source: code,
              }
            },
          )
        }
        debug('js handle finish, total: %d, no-cached: %d', groupedEntries.js.length, noCachedCount)
      }

      if (Array.isArray(groupedEntries.css)) {
        let noCachedCount = 0
        for (let i = 0; i < groupedEntries.css.length; i++) {
          const [file, originalSource] = groupedEntries.css[i] as [string, OutputAsset]

          const rawSource = originalSource.source.toString()

          const hash = cache.computeHash(rawSource)
          cache.calcHashValueChanged(file, hash)
          await cache.process(
            file,
            () => {
              const source = cache.get<string>(file)
              if (source) {
                originalSource.source = source
                debug('css cache hit: %s', file)
              }
              else {
                return false
              }
            },
            async () => {
              const { css } = await styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(originalSource.fileName, appType),
              })
              originalSource.source = css
              onUpdate(file, rawSource, css)
              debug('css handle: %s', file)
              noCachedCount++
              return {
                key: file,
                source: css,
              }
            },
          )
        }
        debug('css handle finish, total: %d, no-cached: %d', groupedEntries.css.length, noCachedCount)
      }

      onEnd()
      debug('end')
    },
  }
}
