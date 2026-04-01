import type { RawSourceMap } from '@ampproject/remapping'
import type { ExistingRawSourceMap, OutputAsset, SourceMap } from 'rollup'
import type { Plugin, ResolvedConfig, TransformResult } from 'vite'
import type { ICreateCacheReturnType } from '@/cache'
import type {
  AppType,
  CreateJsHandlerOptions,
  ICustomAttributesEntities,
  InternalUserDefinedOptions,
  JsHandler,
  LinkedJsModuleResult,
} from '@/types'
import { processCachedTask } from '@/bundlers/shared/cache'
import { toAbsoluteOutputPath } from '@/bundlers/shared/module-graph'
import { parseVueRequest } from '@/bundlers/vite/query'
import { cleanUrl, formatPostcssSourceMap, isCSSRequest } from '@/bundlers/vite/utils'
import { logger } from '@/logger'
import { resolveUniUtsPlatform } from '@/utils'
import { resolveUniAppXOptions } from './options'
import { resolveUniAppXStyleIsolationEnabled } from './style-isolation'
import { transformUVue } from './transform'

interface UniAppXRuntimeState {
  patchPromise: Promise<unknown>
}

interface CreateUniAppXPluginsOptions {
  appType: AppType
  customAttributesEntities: ICustomAttributesEntities
  disabledDefaultTemplateHandler: boolean
  mainCssChunkMatcher: NonNullable<InternalUserDefinedOptions['mainCssChunkMatcher']>
  runtimeState: UniAppXRuntimeState
  styleHandler: InternalUserDefinedOptions['styleHandler']
  jsHandler: JsHandler
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  getResolvedConfig: () => ResolvedConfig | undefined
  isIosPlatform?: boolean
  uniAppX?: InternalUserDefinedOptions['uniAppX']
}

const preprocessorLangs = new Set(['scss', 'sass', 'less', 'styl', 'stylus'])

const INLINE_LANG_RE = /lang\.([a-z]+)/i
const PREPROCESSOR_EXT_RE = /\.(?:scss|sass|less|styl|stylus)(?:\?|$)/i
const UVUE_NVUE_QUERY_RE = /\.(?:uvue|nvue)(?:\?.*)?$/
const UVUE_NVUE_RE = /\.(?:uvue|nvue)$/

function isPreprocessorRequest(id: string, lang?: string): boolean {
  const normalizedLang = lang?.toLowerCase()
  if (normalizedLang && preprocessorLangs.has(normalizedLang)) {
    return true
  }
  const inlineLangMatch = id.match(INLINE_LANG_RE)
  if (inlineLangMatch && preprocessorLangs.has(inlineLangMatch[1].toLowerCase())) {
    return true
  }
  return PREPROCESSOR_EXT_RE.test(id)
}

function resolveUniAppXCssTarget(id: string) {
  return UVUE_NVUE_RE.test(cleanUrl(id)) ? 'uvue' : undefined
}

export function createUniAppXPlugins(options: CreateUniAppXPluginsOptions): Plugin[] {
  const {
    appType,
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    isIosPlatform: providedIosPlatform,
    mainCssChunkMatcher,
    runtimeState,
    styleHandler,
    jsHandler,
    ensureRuntimeClassSet,
    getResolvedConfig,
    uniAppX,
  } = options
  const resolvedUniAppXOptions = resolveUniAppXOptions(uniAppX)
  const isIosPlatform = providedIosPlatform ?? resolveUniUtsPlatform().isAppIos
  const cssHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    uniAppXCssTarget?: 'uvue'
    uniAppXUnsupported: 'error' | 'warn' | 'silent'
    postcssOptions: {
      options: {
        from: string
        map: {
          inline: false
          annotation: false
          sourcesContent: true
        }
      }
    }
  }>()
  let componentLocalStyleEnabled: boolean | undefined

  function shouldEnableComponentLocalStyle() {
    if (!resolvedUniAppXOptions.componentLocalStyles.enabled) {
      componentLocalStyleEnabled = false
      return false
    }
    if (!resolvedUniAppXOptions.componentLocalStyles.onlyWhenStyleIsolationVersion2) {
      componentLocalStyleEnabled = true
      return true
    }
    if (componentLocalStyleEnabled !== undefined) {
      return componentLocalStyleEnabled
    }
    const root = getResolvedConfig()?.root
    componentLocalStyleEnabled = resolveUniAppXStyleIsolationEnabled(root)
    return componentLocalStyleEnabled
  }

  async function transformStyle(code: string, id: string, query?: ReturnType<typeof parseVueRequest>['query']) {
    const parsed = query ?? parseVueRequest(id).query
    if (isCSSRequest(id) || (parsed.vue && parsed.type === 'style')) {
      const cacheKey = `${mainCssChunkMatcher(id, appType) ? '1' : '0'}:${id}`
      let styleHandlerOptions = cssHandlerOptionsCache.get(cacheKey)
      if (!styleHandlerOptions) {
        styleHandlerOptions = {
          isMainChunk: mainCssChunkMatcher(id, appType),
          uniAppXCssTarget: resolveUniAppXCssTarget(id),
          uniAppXUnsupported: resolvedUniAppXOptions.uvueUnsupported,
          postcssOptions: {
            options: {
              from: id,
              map: {
                inline: false,
                annotation: false,
                // PostCSS 可能返回虚拟文件，因此需要启用这一项以获取源内容
                sourcesContent: true,
                // 若上游预处理器已经生成 source map，sources 中可能出现重复条目
              },
            },
          },
        }
        cssHandlerOptionsCache.set(cacheKey, styleHandlerOptions)
      }
      const postcssResult = await styleHandler(code, styleHandlerOptions)
      const warnings = typeof postcssResult.warnings === 'function' ? postcssResult.warnings() : []
      for (const warning of warnings) {
        logger.warn(warning.toString())
      }
      const rawPostcssMap = postcssResult.map.toJSON()
      const postcssMap = await formatPostcssSourceMap(
        rawPostcssMap as Omit<RawSourceMap, 'version'> as ExistingRawSourceMap,
        cleanUrl(id),
      )
      return {
        code: postcssResult.css,
        map: postcssMap as SourceMap,
      } as TransformResult
    }
  }

  const cssPrePlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:css:pre',
    enforce: 'pre',
    async transform(code, id) {
      await runtimeState.patchPromise
      const { query } = parseVueRequest(id)
      const lang = query.lang
      if (isIosPlatform && isPreprocessorRequest(id, lang)) {
        return
      }
      return transformStyle(code, id, query)
    },
  }

  const cssPlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:css',
    async transform(code, id) {
      await runtimeState.patchPromise
      return transformStyle(code, id)
    },
  }

  const cssPlugins = [cssPlugin, cssPrePlugin]

  const nvuePlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:nvue',
    enforce: 'pre',
    async buildStart() {
      await ensureRuntimeClassSet(true)
    },
    async transform(code, id) {
      if (!UVUE_NVUE_QUERY_RE.test(id)) {
        return
      }
      const resolvedConfig = getResolvedConfig()
      const isServeCommand = resolvedConfig?.command === 'serve'
      const isWatchBuild = resolvedConfig?.command === 'build' && !!resolvedConfig.build?.watch
      const isNonWatchBuild = resolvedConfig?.command === 'build' && !resolvedConfig.build?.watch
      const shouldForceRefresh = isServeCommand || isWatchBuild || isNonWatchBuild
      const currentRuntimeSet: Set<string> = shouldForceRefresh
        ? await ensureRuntimeClassSet(true)
        : await ensureRuntimeClassSet()
      const extraOptions = customAttributesEntities.length > 0 || disabledDefaultTemplateHandler
        ? {
            customAttributesEntities,
            disabledDefaultTemplateHandler,
            enableComponentLocalStyle: shouldEnableComponentLocalStyle(),
          }
        : undefined
      if (extraOptions) {
        return transformUVue(code, id, jsHandler, currentRuntimeSet, extraOptions)
      }
      if (shouldEnableComponentLocalStyle()) {
        return transformUVue(code, id, jsHandler, currentRuntimeSet, {
          enableComponentLocalStyle: true,
        })
      }
      return transformUVue(code, id, jsHandler, currentRuntimeSet)
    },
    async handleHotUpdate(ctx) {
      const resolvedConfig = getResolvedConfig()
      if (resolvedConfig?.command !== 'serve') {
        return
      }
      if (!UVUE_NVUE_RE.test(ctx.file)) {
        return
      }
      // 热重载新增类名，无需等待完整重建
      await ensureRuntimeClassSet(true)
    },
    async watchChange(id) {
      const resolvedConfig = getResolvedConfig()
      if (resolvedConfig?.command !== 'build' || !resolvedConfig.build?.watch) {
        return
      }
      if (!UVUE_NVUE_QUERY_RE.test(id)) {
        return
      }
      // 针对 `vite build --watch` 的增量构建刷新运行时类集
      await ensureRuntimeClassSet(true)
    },
  }

  return [
    ...cssPlugins,
    nvuePlugin,
  ]
}

type ApplyLinkedResults = (linked: Record<string, LinkedJsModuleResult> | undefined) => void

interface CreateUniAppXAssetTaskOptions {
  cache: ICreateCacheReturnType
  hashKey?: string
  hashSalt?: string
  createHandlerOptions: (absoluteFilename: string, extra?: CreateJsHandlerOptions) => CreateJsHandlerOptions
  debug: (format: string, ...args: unknown[]) => void
  jsHandler: JsHandler
  onUpdate: (filename: string, oldVal: string, newVal: string) => void
  runtimeSet: Set<string>
  applyLinkedResults: ApplyLinkedResults
  uniAppX?: InternalUserDefinedOptions['uniAppX']
}

export function createUniAppXAssetTask(
  file: string,
  originalSource: OutputAsset,
  outDir: string,
  options: CreateUniAppXAssetTaskOptions,
) {
  return async () => {
    const {
      cache,
      hashKey,
      createHandlerOptions,
      debug,
      jsHandler,
      onUpdate,
      runtimeSet,
      applyLinkedResults,
    } = options
    const absoluteFile = toAbsoluteOutputPath(file, outDir)
    const rawSource = originalSource.source.toString()
    const rawHashSource = options.hashSalt
      ? `${rawSource}\n/*${options.hashSalt}*/`
      : rawSource
    await processCachedTask<string>({
      cache,
      cacheKey: file,
      hashKey,
      rawSource: rawHashSource,
      applyResult(source) {
        originalSource.source = source
      },
      onCacheHit() {
        debug('js cache hit: %s', file)
      },
      async transform() {
        const currentSource = originalSource.source.toString()
        const { code, linked } = await jsHandler(currentSource, runtimeSet, createHandlerOptions(absoluteFile, {
          uniAppX: options.uniAppX ?? true,
          babelParserOptions: {
            plugins: [
              'typescript',
            ],
            sourceType: 'unambiguous',
          },
        }))
        onUpdate(file, currentSource, code)
        debug('js handle: %s', file)
        applyLinkedResults(linked)
        return {
          result: code,
        }
      },
    })
  }
}
