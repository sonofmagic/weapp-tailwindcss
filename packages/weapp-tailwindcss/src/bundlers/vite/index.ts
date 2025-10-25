import type { RawSourceMap } from '@ampproject/remapping'
import type { ExistingRawSourceMap, OutputAsset, OutputChunk, SourceMap } from 'rollup'
import type { Plugin, ResolvedConfig, TransformResult } from 'vite'
import type { CreateJsHandlerOptions, LinkedJsModuleResult, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'
import { transformUVue } from '@/uni-app-x'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../shared/cache'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../shared/module-graph'
import { parseVueRequest } from './query'
import { cleanUrl, formatPostcssSourceMap, isCSSRequest } from './utils'

const debug = createDebug()

interface OutputEntry {
  fileName: string
  output: OutputAsset | OutputChunk
}

function readOutputEntry(entry: OutputEntry): string | undefined {
  if (entry.output.type === 'chunk') {
    return entry.output.code
  }
  const source = entry.output.source
  if (typeof source === 'string') {
    return source
  }
  if (source instanceof Uint8Array) {
    return Buffer.from(source).toString()
  }
  const fallbackSource = source as unknown
  if (fallbackSource == null) {
    return undefined
  }
  if (typeof (fallbackSource as { toString?: unknown }).toString === 'function') {
    return (fallbackSource as { toString: () => string }).toString()
  }
  return undefined
}

function isJavaScriptEntry(entry: OutputEntry): boolean {
  if (entry.output.type === 'chunk') {
    return true
  }
  return entry.fileName.endsWith('.js')
}

function createBundleModuleGraphOptions(
  outputDir: string,
  entries: Map<string, OutputEntry>,
) {
  return {
    resolve(specifier: string, importer: string) {
      return resolveOutputSpecifier(specifier, importer, outputDir, candidate => entries.has(candidate))
    },
    load(id: string) {
      const entry = entries.get(id)
      if (!entry) {
        return undefined
      }
      return readOutputEntry(entry)
    },
    filter(id: string) {
      return entries.has(id)
    },
  }
}

function applyLinkedResults(
  linked: Record<string, LinkedJsModuleResult> | undefined,
  entries: Map<string, OutputEntry>,
  onLinkedUpdate: (fileName: string, previous: string, next: string) => void,
) {
  if (!linked) {
    return
  }

  for (const [id, { code }] of Object.entries(linked)) {
    const entry = entries.get(id)
    if (!entry) {
      continue
    }
    const previous = readOutputEntry(entry)
    if (previous == null || previous === code) {
      continue
    }

    if (entry.output.type === 'chunk') {
      entry.output.code = code
    }
    else {
      entry.output.source = code
    }

    onLinkedUpdate(entry.fileName, previous, code)
  }
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
  let runtimeSet: Set<string> | undefined
  let resolvedConfig: ResolvedConfig | undefined
  onLoad()
  const plugins: Plugin[] = [
    {
      name: `${vitePluginName}:post`,
      enforce: 'post',
      configResolved(config) {
        resolvedConfig = config
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
        const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
        const outDir = resolvedConfig?.build?.outDir
          ? path.resolve(rootDir, resolvedConfig.build.outDir)
          : rootDir
        const jsEntries = new Map<string, OutputEntry>()
        for (const [fileName, output] of entries) {
          const entry: OutputEntry = { fileName, output }
          if (isJavaScriptEntry(entry)) {
            const absolute = toAbsoluteOutputPath(fileName, outDir)
            jsEntries.set(absolute, entry)
          }
        }
        const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
        const groupedEntries = getGroupedEntries(entries, opts)
        runtimeSet = await collectRuntimeClassSet(twPatcher)
        setMangleRuntimeSet(runtimeSet)
        debug('get runtimeSet, class count: %d', runtimeSet.size)
        const handleLinkedUpdate = (fileName: string, previous: string, next: string) => {
          onUpdate(fileName, previous, next)
          debug('js linked handle: %s', fileName)
        }
        const createHandlerOptions = (absoluteFilename: string, extra?: CreateJsHandlerOptions): CreateJsHandlerOptions => ({
          ...extra,
          filename: absoluteFilename,
          moduleGraph: moduleGraphOptions,
          babelParserOptions: {
            ...(extra?.babelParserOptions ?? {}),
            sourceFilename: absoluteFilename,
          },
        })
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
            if (originalSource.type !== 'chunk') {
              continue
            }
            const absoluteFile = toAbsoluteOutputPath(file, outDir)
            const initialRawSource = originalSource.code
            await processCachedTask<string>({
              cache,
              cacheKey: file,
              rawSource: initialRawSource,
              applyResult(source) {
                originalSource.code = source
              },
              onCacheHit() {
                debug('js cache hit: %s', file)
              },
              async transform() {
                const rawSource = originalSource.code
                const { code, linked } = await jsHandler(rawSource, runtimeSet, createHandlerOptions(absoluteFile))
                onUpdate(file, rawSource, code)
                debug('js handle: %s', file)
                applyLinkedResults(linked, jsEntries, handleLinkedUpdate)
                return {
                  result: code,
                }
              },
            })
          }

          if (uniAppX) {
            for (const [file, originalSource] of groupedEntries.js as [string, OutputAsset | OutputChunk][]) {
              if (originalSource.type !== 'asset') {
                continue
              }
              const absoluteFile = toAbsoluteOutputPath(file, outDir)
              const rawSource = originalSource.source.toString()
              await processCachedTask<string>({
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
                  const currentSource = originalSource.source.toString()
                  const { code, linked } = await jsHandler(currentSource, runtimeSet, createHandlerOptions(absoluteFile, {
                    uniAppX,
                    babelParserOptions: {
                      plugins: [
                        'typescript',
                      ],
                      sourceType: 'unambiguous',
                    },
                  }))
                  onUpdate(file, currentSource, code)
                  debug('js handle: %s', file)
                  applyLinkedResults(linked, jsEntries, handleLinkedUpdate)
                  return {
                    result: code,
                  }
                },
              })
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
          runtimeSet = await collectRuntimeClassSet(twPatcher)
        },
        transform(code, id) {
          return transformUVue(code, id, jsHandler, runtimeSet)
        },
      },
    )
  }
  return plugins
}
