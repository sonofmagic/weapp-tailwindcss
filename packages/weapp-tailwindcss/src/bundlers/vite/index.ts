import type { UserDefinedOptions } from '@/types'
import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin } from 'vite'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { logger } from '@/logger'
import { getGroupedEntries } from '@/utils'

const debug = createDebug()

const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`
export const cssLangRE = new RegExp(cssLangs)
export function isCSSRequest(request: string): boolean {
  return cssLangRE.test(request)
}
/**
 * @name UnifiedViteWeappTailwindcssPlugin
 * @description uni-app vite vue3 版本插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function UnifiedViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin[] | undefined {
  const opts = getCompilerContext(options)
  const {
    disabled,
    onEnd,
    onLoad,
    onStart,
    onUpdate,
    templateHandler,
    styleHandler,
    jsHandler,
    mainCssChunkMatcher,
    appType,
    setMangleRuntimeSet,
    cache,
    twPatcher,
    uniAppX,
  } = opts
  if (disabled) {
    return
  }

  twPatcher.patch()

  onLoad()
  // 要在 vite:css 处理之前运行
  const plugins: Plugin[] = [
    {
      name: vitePluginName,
      enforce: 'post',
      async generateBundle(_opt, bundle) {
        debug('start')
        onStart()

        const entries = Object.entries(bundle)
        const groupedEntries = getGroupedEntries(entries, opts)
        const runtimeSet = await twPatcher.getClassSet()
        setMangleRuntimeSet(runtimeSet)
        debug('get runtimeSet, class count: %d', runtimeSet.size)
        const promises: (void | Promise<void>)[] = []
        if (Array.isArray(groupedEntries.html)) {
          for (const element of groupedEntries.html) {
            const [file, originalSource] = element as [string, OutputAsset]

            const oldVal = originalSource.source.toString()

            const hash = cache.computeHash(oldVal)
            cache.calcHashValueChanged(file, hash)
            promises.push(
              cache.process(
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
                  // noCachedCount++
                  return {
                    key: file,
                    source: originalSource.source,
                  }
                },
              ),
            )
          }
        }

        if (Array.isArray(groupedEntries.js)) {
          for (const element of groupedEntries.js.filter(x => x[1].type === 'chunk')) {
            const [file, originalSource] = element as [string, OutputChunk]
            // js maybe asset
            const rawSource = originalSource.code

            const hash = cache.computeHash(rawSource)
            cache.calcHashValueChanged(file, hash)
            promises.push(
              cache.process(
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
                  const hasSourceMap = Boolean(bundle[mapFilename])
                  const { code, map } = await jsHandler(rawSource, runtimeSet, {
                    generateMap: hasSourceMap,
                  })
                  originalSource.code = code
                  onUpdate(file, rawSource, code)
                  debug('js handle: %s', file)
                  // noCachedCount++
                  if (hasSourceMap && map) {
                    ; (bundle[mapFilename] as OutputAsset).source = map.toString()
                  }
                  return {
                    key: file,
                    source: code,
                  }
                },
              ),
            )
          }
        }

        if (Array.isArray(groupedEntries.css)) {
          for (const element of groupedEntries.css) {
            const [file, originalSource] = element as [string, OutputAsset]

            const rawSource = originalSource.source.toString()

            const hash = cache.computeHash(rawSource)
            cache.calcHashValueChanged(file, hash)
            promises.push(
              cache.process(
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
                    postcssOptions: {
                      options: {
                        from: file,
                      },
                    },
                  })
                  originalSource.source = css
                  onUpdate(file, rawSource, css)
                  debug('css handle: %s', file)
                  // noCachedCount++
                  return {
                    key: file,
                    source: css,
                  }
                },
              ),
            )
          }
        }
        await Promise.all(promises)
        onEnd()
        debug('end')
      },
    },
  ]
  if (uniAppX) {
    // https://github.com/dcloudio/uni-app/blob/794d762f4c2d5f76028e604e154840d1e45155ff/packages/uni-app-uts/src/plugins/js/css.ts#L40
  // https://github.com/dcloudio/uni-app/tree/794d762f4c2d5f76028e604e154840d1e45155ff/packages/uni-nvue-styler
  // https://github.com/dcloudio/uni-app/blob/794d762f4c2d5f76028e604e154840d1e45155ff/packages/uni-app-uts/src/plugins/android/css.ts#L31
  // @dcloudio/uni-nvue-styler
    logger.success('uni-app-x')
    plugins.push(
      {
        name: 'weapp-tailwindcss:uni-app-x',
        enforce: 'pre',
        async transform(code, id) {
          if (isCSSRequest(id)) {
            // uvue only support classname selector
            const { css } = await styleHandler(code, {
              isMainChunk: mainCssChunkMatcher(id, appType),
              postcssOptions: {
                options: {
                  from: id,
                },
              },
              uniAppX: true,
            })
            return {
              code: css,
              // map,
            }
          }
        },
      },
    )
  }
  return plugins
}
