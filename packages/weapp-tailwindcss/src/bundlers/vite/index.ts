import type { RawSourceMap } from '@ampproject/remapping'
import type { ExistingRawSourceMap, OutputAsset, OutputChunk, SourceMap } from 'rollup'
import type { Plugin, TransformResult } from 'vite'
import type { UserDefinedOptions } from '@/types'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { transformUVue } from '@/uni-app-x'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../shared/cache'
import { parseVueRequest } from './query'
import { cleanUrl, formatPostcssSourceMap, isCSSRequest } from './utils'

const debug = createDebug()

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
  let runtimeSet: Set<string> | undefined
  onLoad()
  const plugins: Plugin[] = [
    {
      name: `${vitePluginName}:post`,
      enforce: 'post',
      configResolved(config) {
        if (typeof config.css.postcss === 'object' && Array.isArray(config.css.postcss.plugins)) {
          const idx = config.css.postcss.plugins.findIndex(x =>
            // @ts-ignore
            x.postcssPlugin === 'postcss-html-transform')
          if (idx > -1) {
            config.css.postcss.plugins.splice(idx, 1, postcssHtmlTransform())
            debug('remove postcss-html-transform plugin from vite config')
          }
        }
      },
      async generateBundle(_opt, bundle) {
        debug('start')
        onStart()

        const entries = Object.entries(bundle)
        const groupedEntries = getGroupedEntries(entries, opts)
        runtimeSet = await twPatcher.getClassSet()
        setMangleRuntimeSet(runtimeSet)
        debug('get runtimeSet, class count: %d', runtimeSet.size)
        const tasks: Promise<void>[] = []
        if (Array.isArray(groupedEntries.html)) {
          for (const [file, originalSource] of groupedEntries.html as [string, OutputAsset][]) {
            const rawSource = originalSource.source.toString()
            tasks.push(
              processCachedTask<string>({
                cache,
                cacheKey: file,
                rawSource,
                applyResult(source) {
                  originalSource.source = source
                },
                onCacheHit() {
                  debug('html cache hit: %s', file)
                },
                async transform() {
                  const transformed = await templateHandler(rawSource, {
                    runtimeSet,
                  })
                  onUpdate(file, rawSource, transformed)
                  debug('html handle: %s', file)
                  return {
                    result: transformed,
                  }
                },
              }),
            )
          }
        }

        if (Array.isArray(groupedEntries.js)) {
          for (const [file, originalSource] of groupedEntries.js as [string, OutputAsset | OutputChunk][]) {
            if (originalSource.type === 'chunk') {
              const rawSource = originalSource.code
              tasks.push(
                processCachedTask<string>({
                  cache,
                  cacheKey: file,
                  rawSource,
                  applyResult(source) {
                    originalSource.code = source
                  },
                  onCacheHit() {
                    debug('js cache hit: %s', file)
                  },
                  async transform() {
                    const { code } = await jsHandler(rawSource, runtimeSet)
                    onUpdate(file, rawSource, code)
                    debug('js handle: %s', file)
                    return {
                      result: code,
                    }
                  },
                }),
              )
            }
          }

          if (uniAppX) {
            for (const [file, originalSource] of groupedEntries.js as [string, OutputAsset | OutputChunk][]) {
              if (originalSource.type === 'asset') {
                const rawSource = originalSource.source.toString()
                tasks.push(
                  processCachedTask<string>({
                    cache,
                    cacheKey: file,
                    rawSource,
                    applyResult(source) {
                      originalSource.source = source
                    },
                    onCacheHit() {
                      debug('js cache hit: %s', file)
                    },
                    async transform() {
                      const { code } = await jsHandler(rawSource, runtimeSet, {
                        uniAppX,
                        babelParserOptions: {
                          plugins: [
                            'typescript',
                          ],
                          sourceType: 'unambiguous',
                        },
                      })
                      onUpdate(file, rawSource, code)
                      debug('js handle: %s', file)
                      return {
                        result: code,
                      }
                    },
                  }),
                )
              }
            }
          }
        }

        if (Array.isArray(groupedEntries.css)) {
          for (const [file, originalSource] of groupedEntries.css as [string, OutputAsset][]) {
            const rawSource = originalSource.source.toString()
            tasks.push(
              processCachedTask<string>({
                cache,
                cacheKey: file,
                rawSource,
                applyResult(source) {
                  originalSource.source = source
                },
                onCacheHit() {
                  debug('css cache hit: %s', file)
                },
                async transform() {
                  const { css } = await styleHandler(rawSource, {
                    isMainChunk: mainCssChunkMatcher(originalSource.fileName, appType),
                    postcssOptions: {
                      options: {
                        from: file,
                      },
                    },
                    majorVersion: twPatcher.majorVersion,
                  })
                  onUpdate(file, rawSource, css)
                  debug('css handle: %s', file)
                  return {
                    result: css,
                  }
                },
              }),
            )
          }
        }
        await Promise.all(tasks)
        onEnd()
        debug('end')
      },
    },
  ]
  if (uniAppX) {
    /**
     * https://github.com/dcloudio/uni-app/blob/794d762f4c2d5f76028e604e154840d1e45155ff/packages/uni-app-uts/src/plugins/js/css.ts#L40
     * https://github.com/dcloudio/uni-app/tree/794d762f4c2d5f76028e604e154840d1e45155ff/packages/uni-nvue-styler
     * https://github.com/dcloudio/uni-app/blob/794d762f4c2d5f76028e604e154840d1e45155ff/packages/uni-app-uts/src/plugins/android/css.ts#L31
     */
    ;([undefined, 'pre'] as ('pre' | 'post' | undefined)[]).forEach((enforce) => {
      plugins.push(
        {
          name: `weapp-tailwindcss:uni-app-x:css${enforce ? `:${enforce}` : ''}`,
          enforce,
          async transform(code, id) {
            const { query } = parseVueRequest(id)
            if (isCSSRequest(id) || (query.vue && query.type === 'style')) {
            // uvue only support classname selector
              const postcssResult = await styleHandler(code, {
                isMainChunk: mainCssChunkMatcher(id, appType),
                postcssOptions: {
                  options: {
                    from: id,
                    map: {
                      inline: false,
                      annotation: false,
                      // postcss may return virtual files
                      // we cannot obtain content of them, so this needs to be enabled
                      sourcesContent: true,
                    // when a previous preprocessor map is provided, duplicates may appear in `postcssResult.map.sources`
                    },
                  },
                },
              })
              const rawPostcssMap = postcssResult.map.toJSON()
              const postcssMap = await formatPostcssSourceMap(
              // version property of rawPostcssMap is declared as string
              // but actually it is a number
                rawPostcssMap as Omit<RawSourceMap, 'version'> as ExistingRawSourceMap,
                cleanUrl(id),
              )
              return {
                code: postcssResult.css,
                map: postcssMap as SourceMap,
              } as TransformResult
            }
          },
        },
      )
    })

    plugins.push(
      {
        name: 'weapp-tailwindcss:uni-app-x:nvue',
        enforce: 'pre',
        async buildStart() {
          const res = await twPatcher.extract({ write: false })
          if (res) {
            runtimeSet = res.classSet
          }
        },
        transform(code, id) {
          return transformUVue(code, id, jsHandler, runtimeSet)
        },
      },
    )
  }
  return plugins
}
