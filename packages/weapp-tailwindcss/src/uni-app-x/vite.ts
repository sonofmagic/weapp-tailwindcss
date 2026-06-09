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
import path from 'node:path'
import process from 'node:process'
import { processCachedTask } from '@/bundlers/shared/cache'
import { hasTailwindApplyDirective, hasTailwindSourceDirectives } from '@/bundlers/shared/generator-css/directives'
import { toAbsoluteOutputPath } from '@/bundlers/shared/module-graph'
import { parseVueRequest } from '@/bundlers/vite/query'
import { cleanUrl, formatPostcssSourceMap, isCSSRequest, normalizePath } from '@/bundlers/vite/utils'
import { logger } from '@/logger'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { resolveUniUtsPlatform } from '@/utils'
import { omitUndefined } from '@/utils/object'
import { isUniAppXEnabled, resolveUniAppXOptions } from './options'
import {
  collectUniAppXHarmonyApplyStyleSources,
  collectUniAppXHarmonyApplyStyleSourcesFromSource,
  collectUniAppXHarmonyApplyUtilities,
  collectUniAppXHarmonyApplyUtilitiesFromSources,
  createUniAppXBundleAssetSourceGetter,
  createUniAppXHarmonyApplyGeneratorSource,
  injectUniAppXHarmonyBundleStyles,
  injectUniAppXStylePlaceholder,
  isUniAppXHarmonyBundle,
} from './style-asset'
import { resolveUniAppXStyleIsolationEnabled } from './style-isolation'

type TransformUVue = typeof import('./transform')['transformUVue']
let transformUVuePromise: Promise<TransformUVue> | undefined

function loadTransformUVue(): Promise<TransformUVue> {
  transformUVuePromise ??= import('./transform').then(mod => mod.transformUVue)
  return transformUVuePromise
}

interface UniAppXRuntimeState {
  readyPromise: Promise<unknown>
}

interface CreateUniAppXPluginsOptions {
  appType: AppType
  customAttributesEntities: ICustomAttributesEntities
  disabledDefaultTemplateHandler: boolean
  mainCssChunkMatcher: NonNullable<InternalUserDefinedOptions['mainCssChunkMatcher']>
  runtimeState: UniAppXRuntimeState
  styleHandler: InternalUserDefinedOptions['styleHandler']
  generateCss?: ((id: string, code: string, hookContext?: { addWatchFile?: (id: string) => void }) => Promise<string | undefined> | string | undefined) | undefined
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
const CSS_MODULE_EXPORT_RE = /^\s*export\s+default\s+(?:\{|\w|\[\])/

function isPreprocessorRequest(id: string, lang?: string): boolean {
  const normalizedLang = lang?.toLowerCase()
  if (normalizedLang && preprocessorLangs.has(normalizedLang)) {
    return true
  }
  const inlineLangMatch = id.match(INLINE_LANG_RE)
  const inlineLang = inlineLangMatch?.[1]
  if (inlineLang && preprocessorLangs.has(inlineLang.toLowerCase())) {
    return true
  }
  return PREPROCESSOR_EXT_RE.test(id)
}

function resolveUniAppXCssTarget(id: string) {
  return UVUE_NVUE_RE.test(cleanUrl(id)) ? 'uvue' : undefined
}

function resolveUniAppXJsTransformEnabled(uniAppX: InternalUserDefinedOptions['uniAppX'] | undefined) {
  return uniAppX === undefined ? true : isUniAppXEnabled(uniAppX)
}

function isCssModuleExport(code: string) {
  return CSS_MODULE_EXPORT_RE.test(code)
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
    generateCss,
    jsHandler,
    ensureRuntimeClassSet,
    getResolvedConfig,
    uniAppX,
  } = options
  const resolvedUniAppXOptions = resolveUniAppXOptions(uniAppX)
  const utsPlatform = resolveUniUtsPlatform()
  const isIosPlatform = providedIosPlatform ?? utsPlatform.isAppIos
  const isHarmonyPlatform = utsPlatform.isAppHarmony
  const cssHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    uniAppXCssTarget?: 'uvue' | undefined
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
  const harmonyApplyStyleSources = new Set<string>()
  const harmonyApplyUtilities = new Set<string>()

  function rememberHarmonyApplySource(code: string) {
    const styleSources = collectUniAppXHarmonyApplyStyleSourcesFromSource(code)
    if (styleSources.length === 0) {
      return
    }
    for (const styleSource of styleSources) {
      harmonyApplyStyleSources.add(styleSource)
      for (const utility of collectUniAppXHarmonyApplyUtilitiesFromSources([styleSource])) {
        harmonyApplyUtilities.add(utility)
      }
    }
  }

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

  function shouldEnableHarmonyPageLocalStyle() {
    return isHarmonyPlatform && resolvedUniAppXOptions.componentLocalStyles.enabled
  }

  function isHarmonyBuildTarget() {
    if (resolveUniUtsPlatform().isAppHarmony) {
      return true
    }
    return isUniAppXHarmonyOutDir(getResolvedConfig()?.build?.outDir)
  }

  async function transformStyle(code: string, id: string, query?: ReturnType<typeof parseVueRequest>['query'], hookContext?: { addWatchFile?: (id: string) => void }) {
    const parsed = query ?? parseVueRequest(id).query
    if (isCSSRequest(id) || (parsed.vue && parsed.type === 'style')) {
      if (isCssModuleExport(code)) {
        return
      }
      const shouldGenerateCss = hasTailwindSourceDirectives(code, { importFallback: true })
        || hasTailwindApplyDirective(code)
      rememberHarmonyApplySource(code)
      const generatedCss = (
        shouldGenerateCss
      )
        ? await generateCss?.(id, code, hookContext)
        : undefined
      const styleCode = typeof generatedCss === 'string' && generatedCss.trim().length > 0
        ? generatedCss
        : code
      const cacheKey = `${mainCssChunkMatcher(id, appType) ? '1' : '0'}:${id}`
      let styleHandlerOptions = cssHandlerOptionsCache.get(cacheKey)
      if (!styleHandlerOptions) {
        styleHandlerOptions = omitUndefined({
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
        }) as NonNullable<typeof styleHandlerOptions>
        cssHandlerOptionsCache.set(cacheKey, styleHandlerOptions)
      }
      const postcssResult = await styleHandler(styleCode, styleHandlerOptions)
      const warnings = typeof postcssResult.warnings === 'function' ? postcssResult.warnings() : []
      for (const warning of warnings) {
        logger.warn(warning.toString())
      }
      const rawPostcssMap = postcssResult.map.toJSON()
      const postcssMap = await formatPostcssSourceMap(
        rawPostcssMap as Omit<RawSourceMap, 'version'> as ExistingRawSourceMap,
        normalizePath(cleanUrl(id)),
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
      await runtimeState.readyPromise
      const { query } = parseVueRequest(id)
      const lang = query.lang
      if (isIosPlatform && isPreprocessorRequest(id, lang)) {
        return
      }
      return transformStyle(code, id, query, this)
    },
  }

  const cssPlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:css',
    async transform(code, id) {
      await runtimeState.readyPromise
      return transformStyle(code, id, undefined, this)
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
      rememberHarmonyApplySource(code)
      const resolvedConfig = getResolvedConfig()
      const isServeCommand = resolvedConfig?.command === 'serve'
      const isWatchBuild = resolvedConfig?.command === 'build' && !!resolvedConfig.build?.watch
      const isNonWatchBuild = resolvedConfig?.command === 'build' && !resolvedConfig.build?.watch
      const shouldForceRefresh = isServeCommand || isWatchBuild || isNonWatchBuild
      const currentRuntimeSet: Set<string> = shouldForceRefresh
        ? await ensureRuntimeClassSet(true)
        : await ensureRuntimeClassSet()
      const transformUVue = await loadTransformUVue()
      const enableComponentLocalStyle = shouldEnableComponentLocalStyle()
      const enablePageLocalStyle = shouldEnableHarmonyPageLocalStyle()
      const shouldPassOptions = customAttributesEntities.length > 0
        || disabledDefaultTemplateHandler
        || enableComponentLocalStyle
        || enablePageLocalStyle
      if (shouldPassOptions) {
        return transformUVue(code, id, jsHandler, currentRuntimeSet, omitUndefined({
          ...(customAttributesEntities.length > 0 ? { customAttributesEntities } : {}),
          ...(disabledDefaultTemplateHandler ? { disabledDefaultTemplateHandler } : {}),
          ...(enableComponentLocalStyle ? { enableComponentLocalStyle } : {}),
          ...(enablePageLocalStyle ? { enablePageLocalStyle } : {}),
        }))
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

  const stylePlaceholderPlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:style-placeholder',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      async handler(_options, bundle) {
        const currentUtsPlatform = resolveUniUtsPlatform()
        const isHarmonyBundle = isUniAppXHarmonyBundle(bundle)
        const isHarmonyTarget = currentUtsPlatform.isAppHarmony || isHarmonyBundle || isHarmonyBuildTarget()
        if (!currentUtsPlatform.isApp && !isHarmonyTarget) {
          return
        }
        const getAssetSource = createUniAppXBundleAssetSourceGetter(bundle)
        if (isHarmonyTarget) {
          const cssSources: string[] = []
          const applyStyleSources = [
            ...harmonyApplyStyleSources,
            ...collectUniAppXHarmonyApplyStyleSources(bundle),
          ]
          const applyUtilities = new Set([
            ...harmonyApplyUtilities,
            ...collectUniAppXHarmonyApplyUtilities(bundle),
          ])
          if (applyStyleSources.length > 0 && applyUtilities.size > 0) {
            const harmonyApplyCssFile = path.resolve(getResolvedConfig()?.root ?? process.cwd(), 'uni-app-x-harmony-apply.css')
            const generatedCss = await generateCss?.(
              harmonyApplyCssFile,
              createUniAppXHarmonyApplyGeneratorSource(applyStyleSources, applyUtilities),
              this,
            )
            if (typeof generatedCss === 'string' && generatedCss.trim().length > 0) {
              cssSources.push(generatedCss)
            }
          }
          injectUniAppXHarmonyBundleStyles(bundle, {
            cssSources,
            excludeComponents: shouldEnableComponentLocalStyle(),
          })
        }
        for (const [file, item] of Object.entries(bundle)) {
          if (item.type !== 'asset' || !file.endsWith('.uvue.ts')) {
            continue
          }
          const currentSource = String(item.source)
          const nextSource = injectUniAppXStylePlaceholder(file, currentSource, getAssetSource)
          if (nextSource !== currentSource) {
            item.source = nextSource
          }
        }
      },
    },
  }

  return [
    ...cssPlugins,
    nvuePlugin,
    stylePlaceholderPlugin,
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
  getAssetSource?: (file: string) => string | undefined
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
      getAssetSource,
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
          uniAppX: resolveUniAppXJsTransformEnabled(options.uniAppX),
          babelParserOptions: {
            plugins: [
              'typescript',
            ],
            sourceType: 'unambiguous',
          },
        }))
        const nextCode = injectUniAppXStylePlaceholder(file, code, getAssetSource)
        onUpdate(file, currentSource, nextCode)
        debug('js handle: %s', file)
        applyLinkedResults(linked)
        return {
          result: nextCode,
        }
      },
    })
  }
}
