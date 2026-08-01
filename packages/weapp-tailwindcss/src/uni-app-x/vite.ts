import type { RawSourceMap } from '@ampproject/remapping'
import type { ExistingRawSourceMap, OutputAsset, SourceMap } from 'rollup'
import type { Plugin, TransformResult } from 'vite'
import type { CreateUniAppXPluginsOptions } from './vite/plugin-options'
import type { ICreateCacheReturnType } from '@/cache'
import type {
  CreateJsHandlerOptions,
  InternalUserDefinedOptions,
  JsHandler,
  LinkedJsModuleResult,
} from '@/types'
import path from 'node:path'
import process from 'node:process'
import { normalizeTailwindcssV4InfinityCalcCss } from '@weapp-tailwindcss/postcss'
import { processCachedTask } from '@/bundlers/shared/cache'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '@/bundlers/shared/generator-css/directives'
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
  collectUniAppXHarmonyApplyUtilities,
  createUniAppXBundleAssetSourceGetter,
  createUniAppXHarmonyApplyGeneratorSource,
  injectUniAppXHarmonyBundleStyles,
  injectUniAppXStylePlaceholder,
} from './style-asset'
import { resolveUniAppXStyleIsolationEnabled } from './style-isolation'
import { retainUniAppXAuthorApplyCss } from './vite/author-apply'
import { createUniAppXHarmonyApplyExpander } from './vite/harmony-apply'
import { createUniAppXNativeHmrReloader } from './vite/native-hmr'
import { createUniAppXNativeBuildTargetResolver } from './vite/native-target'
import { isCssModuleExport, isPreprocessorRequest, resolveUniAppXCssTarget } from './vite/style-request'

type TransformUVue = typeof import('./transform')['transformUVue']
let transformUVuePromise: Promise<TransformUVue> | undefined

function loadTransformUVue(): Promise<TransformUVue> {
  transformUVuePromise ??= import('./transform').then(mod => mod.transformUVue)
  return transformUVuePromise
}

const UVUE_NVUE_QUERY_RE = /\.(?:uvue|nvue)(?:\?.*)?$/
const UVUE_NVUE_RE = /\.(?:uvue|nvue)$/

function resolveUniAppXJsTransformEnabled(uniAppX: InternalUserDefinedOptions['uniAppX'] | undefined) {
  return uniAppX === undefined ? true : isUniAppXEnabled(uniAppX)
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
    syncSourceCandidatesForHotUpdate,
    tailwindRootCssModuleIds = [],
    generateCss,
    jsHandler,
    ensureRuntimeClassSet,
    getResolvedConfig,
    isEnabled = () => true,
    uniAppX,
    viteProcessedCssSourceFiles = [],
  } = options
  const resolvedUniAppXOptions = resolveUniAppXOptions(uniAppX)
  const utsPlatform = resolveUniUtsPlatform()
  const isIosPlatform = providedIosPlatform ?? utsPlatform.isAppIos
  const cssHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    uniAppXCssTarget?: 'uvue' | undefined
    uniAppXCssSource?: 'tailwind-root' | 'author-apply' | undefined
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
  const nativeLocalStyleModuleIds = new Set<string>()
  let componentLocalStyleEnabled: boolean | undefined
  const isNativeAppBuildTarget = createUniAppXNativeBuildTargetResolver(getResolvedConfig)
  const nativeHmrReloader = createUniAppXNativeHmrReloader({
    ensureRuntimeClassSet,
    isNativeAppBuildTarget,
    localStyleModuleIds: nativeLocalStyleModuleIds,
    syncSourceCandidates: syncSourceCandidatesForHotUpdate,
    tailwindRootCssModuleIds,
    viteProcessedCssSourceFiles,
  })

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

  function shouldEnableNativePageLocalStyle(id: string) {
    return isNativeAppBuildTarget(id) && resolvedUniAppXOptions.componentLocalStyles.enabled
  }

  function isHarmonyBuildTarget() {
    if (resolveUniUtsPlatform().isAppHarmony) {
      return true
    }
    return isUniAppXHarmonyOutDir(getResolvedConfig()?.build?.outDir)
  }

  function getStyleHandlerOptions(id: string, source?: 'tailwind-root' | 'author-apply') {
    const isMainChunk = source === 'tailwind-root' || mainCssChunkMatcher(id, appType)
    const cacheKey = `${isMainChunk ? '1' : '0'}:${source ?? ''}:${id}`
    let styleHandlerOptions = cssHandlerOptionsCache.get(cacheKey)
    if (!styleHandlerOptions) {
      styleHandlerOptions = omitUndefined({
        isMainChunk,
        uniAppXCssTarget: isNativeAppBuildTarget(id) ? resolveUniAppXCssTarget(id) : undefined,
        uniAppXCssSource: isNativeAppBuildTarget(id) ? source : undefined,
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
      }) as NonNullable<ReturnType<typeof cssHandlerOptionsCache.get>>
      cssHandlerOptionsCache.set(cacheKey, styleHandlerOptions)
    }
    return styleHandlerOptions
  }

  function reportStyleWarnings(result: Awaited<ReturnType<typeof styleHandler>>) {
    const warnings = typeof result.warnings === 'function' ? result.warnings() : []
    for (const warning of warnings) {
      logger.warn(warning.toString())
    }
  }

  async function transformStyle(code: string, id: string, query?: ReturnType<typeof parseVueRequest>['query'], hookContext?: { addWatchFile?: (id: string) => void }) {
    const isNativeStyle = isNativeAppBuildTarget(id)
    const parsed = query ?? parseVueRequest(id).query
    if (isCSSRequest(id) || (parsed.vue && parsed.type === 'style')) {
      if (isCssModuleExport(code)) {
        return
      }
      const hasTailwindRoot = hasTailwindRootDirectives(code, { importFallback: true })
      const hasTailwindApply = hasTailwindApplyDirective(code)
      const shouldGenerateCss = hasTailwindRoot || hasTailwindApply
      const isNativeSfcAuthorStyle = isNativeStyle && resolveUniAppXCssTarget(id) === 'uvue'
      if (!shouldGenerateCss && (!isNativeStyle || isNativeSfcAuthorStyle)) {
        return
      }
      harmonyApply.rememberSource(code, id)
      const generatedCss = (
        shouldGenerateCss
      )
        ? await generateCss?.(
            id,
            isNativeSfcAuthorStyle && hasTailwindApply && !hasTailwindRoot
              ? harmonyApply.prepareStyles(code, id)
              : code,
            {
              ...hookContext,
              disableSourceScan: isNativeSfcAuthorStyle && hasTailwindApply && !hasTailwindRoot,
              sourceCandidates: isNativeSfcAuthorStyle && hasTailwindApply && !hasTailwindRoot ? [] : undefined,
              transient: isNativeSfcAuthorStyle && hasTailwindApply && !hasTailwindRoot,
            },
          )
        : undefined
      const styleCode = typeof generatedCss === 'string' && generatedCss.trim().length > 0
        ? hasTailwindApply && !hasTailwindRoot
          ? retainUniAppXAuthorApplyCss(generatedCss, code)
          : generatedCss
        : code
      const styleHandlerOptions = getStyleHandlerOptions(
        id,
        isNativeStyle && hasTailwindRoot ? 'tailwind-root' : isNativeStyle ? 'author-apply' : undefined,
      )
      const postcssResult = await styleHandler(styleCode, styleHandlerOptions)
      reportStyleWarnings(postcssResult)
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

  const harmonyApply = createUniAppXHarmonyApplyExpander({
    generateCss,
    getResolvedConfig,
    isHarmonyBuildTarget,
    async transformCss(css, id) {
      const result = await styleHandler(css, getStyleHandlerOptions(id, 'author-apply'))
      reportStyleWarnings(result)
      return result.css
    },
  })

  const cssPrePlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:css:pre',
    enforce: 'pre',
    async transform(code, id) {
      if (!isEnabled()) {
        return
      }
      await runtimeState.readyPromise
      const { query } = parseVueRequest(id)
      const lang = query.lang
      if (isIosPlatform && isPreprocessorRequest(id, lang)) {
        const normalizedCode = normalizeTailwindcssV4InfinityCalcCss(code)
        return normalizedCode === code
          ? undefined
          : { code: normalizedCode, map: null }
      }
      return transformStyle(code, id, query, this)
    },
  }

  const cssPlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:css',
    async transform(code, id) {
      if (!isEnabled()) {
        return
      }
      await runtimeState.readyPromise
      return transformStyle(code, id, undefined, this)
    },
  }

  const cssPlugins = [cssPlugin, cssPrePlugin]

  const nvuePlugin: Plugin = {
    name: 'weapp-tailwindcss:uni-app-x:nvue',
    enforce: 'pre',
    async buildStart() {
      if (!isEnabled()) {
        return
      }
      await nativeHmrReloader.refreshBaseline()
    },
    transform: {
      order: 'pre',
      async handler(code, id) {
        if (!isEnabled()) {
          return
        }
        if (!UVUE_NVUE_QUERY_RE.test(id)) {
          return
        }
        if (isNativeAppBuildTarget(id)) {
          nativeLocalStyleModuleIds.add(id)
          nativeLocalStyleModuleIds.add(cleanUrl(id))
        }
        harmonyApply.rememberSource(code, id, true)
        const resolvedConfig = getResolvedConfig()
        const isServeCommand = resolvedConfig?.command === 'serve'
        const isWatchBuild = resolvedConfig?.command === 'build' && !!resolvedConfig.build?.watch
        const isNonWatchBuild = resolvedConfig?.command === 'build' && !resolvedConfig.build?.watch
        const shouldForceRefresh = isServeCommand || isWatchBuild || isNonWatchBuild
        const currentRuntimeSet: Set<string> = shouldForceRefresh
          ? await ensureRuntimeClassSet(true)
          : await ensureRuntimeClassSet()
        nativeHmrReloader.remember(currentRuntimeSet)
        const transformUVue = await loadTransformUVue()
        const enableComponentLocalStyle = shouldEnableComponentLocalStyle()
        const enablePageLocalStyle = shouldEnableNativePageLocalStyle(id)
        const shouldPassOptions = customAttributesEntities.length > 0
          || disabledDefaultTemplateHandler
          || enableComponentLocalStyle
          || enablePageLocalStyle
        const result = shouldPassOptions
          ? transformUVue(code, id, jsHandler, currentRuntimeSet, omitUndefined({
              ...(customAttributesEntities.length > 0 ? { customAttributesEntities } : {}),
              ...(disabledDefaultTemplateHandler ? { disabledDefaultTemplateHandler } : {}),
              ...(enableComponentLocalStyle ? { enableComponentLocalStyle } : {}),
              ...(enablePageLocalStyle ? { enablePageLocalStyle } : {}),
            }))
          : transformUVue(code, id, jsHandler, currentRuntimeSet)
        if (result?.code) {
          harmonyApply.rememberSource(result.code, id)
          const expandedCode = await harmonyApply.expandStyles(result.code, id, this)
          if (expandedCode !== result.code) {
            return {
              code: expandedCode,
              map: null,
            }
          }
        }
        return result
      },
    },
    async handleHotUpdate(ctx) {
      if (!isEnabled()) {
        return
      }
      const resolvedConfig = getResolvedConfig()
      if (resolvedConfig?.command !== 'serve') {
        return
      }
      if (!UVUE_NVUE_RE.test(ctx.file) && !isCSSRequest(ctx.file)) {
        return
      }
      return nativeHmrReloader.handleHotUpdate(ctx)
    },
    async watchChange(id) {
      if (!isEnabled()) {
        return
      }
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
        if (!isEnabled()) {
          return
        }
        const currentUtsPlatform = resolveUniUtsPlatform()
        const canInferHarmonyTarget = !currentUtsPlatform.normalized || currentUtsPlatform.isApp
        const isHarmonyTarget = currentUtsPlatform.isAppHarmony || (canInferHarmonyTarget && isHarmonyBuildTarget())
        if (!isNativeAppBuildTarget() && !isHarmonyTarget) {
          return
        }
        const getAssetSource = createUniAppXBundleAssetSourceGetter(bundle)
        if (isHarmonyTarget) {
          const cssSources: string[] = []
          const applyStyleSources = harmonyApply.styleSources.size > 0
            ? [...harmonyApply.styleSources]
            : collectUniAppXHarmonyApplyStyleSources(bundle)
          const applyUtilities = new Set([
            ...harmonyApply.utilities,
            ...collectUniAppXHarmonyApplyUtilities(bundle),
          ])
          if (applyStyleSources.length > 0 && applyUtilities.size > 0) {
            const harmonyApplyCssFile = path.resolve(getResolvedConfig()?.root ?? process.cwd(), 'uni-app-x-harmony-apply.css')
            const generatedCss = await generateCss?.(
              harmonyApplyCssFile,
              createUniAppXHarmonyApplyGeneratorSource(applyStyleSources, applyUtilities),
              {
                addWatchFile: this?.addWatchFile?.bind(this),
                disableSourceScan: true,
                sourceCandidates: [],
                transient: true,
              },
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
  getCssSources?: () => Iterable<string | undefined>
  injectStylePlaceholder?: boolean
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
      getCssSources,
      injectStylePlaceholder = true,
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
        const nextCode = injectStylePlaceholder
          ? injectUniAppXStylePlaceholder(file, code, getAssetSource, getCssSources?.())
          : code
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
