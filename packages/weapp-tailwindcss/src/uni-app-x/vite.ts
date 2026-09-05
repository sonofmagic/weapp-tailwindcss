import type { RawSourceMap } from '@ampproject/remapping'
import type { ExistingRawSourceMap, SourceMap } from 'rollup'
import type { Plugin, TransformResult } from 'vite'
import type { CreateUniAppXPluginsOptions } from './vite/plugin-options'
import path from 'node:path'
import process from 'node:process'
import {
  normalizeUniAppXImportantApplyForSass,
  restoreUniAppXImportantApplyMarker,
} from '@weapp-tailwindcss/postcss'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '@/bundlers/shared/generator-css/directives'
import { extractSfcStyleBlocks } from '@/bundlers/vite/generate-bundle/sfc-style-source'
import { parseVueRequest } from '@/bundlers/vite/query'
import { cleanUrl, formatPostcssSourceMap, isCSSRequest, normalizePath } from '@/bundlers/vite/utils'
import { logger } from '@/logger'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { shouldEnablePageLocalStyle as isPageLocalStyleFile } from '@/uni-app-x/local-style-matcher'
import { resolveUniUtsPlatform } from '@/utils'
import { omitUndefined } from '@/utils/object'
import { resolveUniAppXOptions } from './options'
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
import { isCssModuleExport, normalizeRelativeTailwindReferences, resolvePreprocessorTransform, resolveUniAppXCssTarget } from './vite/style-request'
import { hasUniAppXImportantApply, resolveUniAppXStyleSource } from './vite/style-source'
import { createUniAppXWebLocalStyleBridge } from './vite/web-local-style'

export { createUniAppXAssetTask } from './vite/asset-task'

type TransformUVue = typeof import('./transform')['transformUVue']
let transformUVuePromise: Promise<TransformUVue> | undefined
function loadTransformUVue(): Promise<TransformUVue> {
  transformUVuePromise ??= import('./transform').then(mod => mod.transformUVue)
  return transformUVuePromise
}
const UVUE_NVUE_QUERY_RE = /\.(?:uvue|nvue)(?:\?.*)?$/
const UVUE_NVUE_RE = /\.(?:uvue|nvue)$/
export function createUniAppXPlugins(options: CreateUniAppXPluginsOptions): Plugin[] {
  const {
    appType,
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    isIosPlatform: providedIosPlatform,
    mainCssChunkMatcher,
    registerModuleGraphCandidates,
    runtimeState,
    styleHandler,
    syncSourceCandidatesForHotUpdate,
    tailwindRootCssModuleIds = [],
    generateCss,
    hmrCssModuleVersions,
    jsHandler,
    ensureRuntimeClassSet,
    getResolvedConfig,
    isEnabled = () => true,
    isNativeAppStyleTarget = () => false,
    isWebGeneratorTarget = () => resolveUniUtsPlatform().isWeb,
    uniAppX,
    viteProcessedCssSourceFiles = [],
    webCssEntryDiagnostics,
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
  const knownSfcSources = new Map<string, string>()
  const pendingSfcTransforms = new Map<string, Promise<TransformResult | undefined>>()
  const webLocalStyle = createUniAppXWebLocalStyleBridge(isWebGeneratorTarget, hmrCssModuleVersions)
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
  function shouldEnablePageLocalStyleForFile(id: string) {
    return resolvedUniAppXOptions.componentLocalStyles.enabled && (isNativeAppBuildTarget(id) || isPageLocalStyleFile(id, resolvedUniAppXOptions.componentLocalStyles.pageMatcher))
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
    const resolvedSource = resolveUniAppXStyleSource(code, parsed)
    if (resolvedSource.skip) {
      return
    }
    code = resolvedSource.code
    if (isCSSRequest(id) || (parsed.vue && parsed.type === 'style')) {
      if (isCssModuleExport(code)) {
        return
      }
      const sourceCode = normalizeRelativeTailwindReferences(
        restoreUniAppXImportantApplyMarker(code),
        id,
      )
      const hasTailwindRoot = hasTailwindRootDirectives(sourceCode, { importFallback: true })
      const hasTailwindApply = hasTailwindApplyDirective(sourceCode)
      const shouldGenerateCss = hasTailwindRoot || hasTailwindApply
      const isNativeSfcAuthorStyle = isNativeStyle && resolveUniAppXCssTarget(id) === 'uvue'
      if (!shouldGenerateCss && (!isNativeStyle || isNativeSfcAuthorStyle)) {
        return
      }
      harmonyApply.rememberSource(sourceCode, id)
      const generatedCss = (
        shouldGenerateCss
      )
        ? await generateCss?.(
            id,
            isNativeSfcAuthorStyle && hasTailwindApply && !hasTailwindRoot
              ? harmonyApply.prepareStyles(sourceCode, id)
              : sourceCode,
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
          ? retainUniAppXAuthorApplyCss(generatedCss, sourceCode)
          : generatedCss
        : sourceCode
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
    load: {
      order: 'pre',
      async handler(id) {
        const { filename, query } = parseVueRequest(id)
        if (!query.vue || query.type !== 'style' || !UVUE_NVUE_RE.test(filename)) {
          return
        }
        const source = knownSfcSources.get(filename)
        const style = source ? extractSfcStyleBlocks(source)[query.index ?? 0] : undefined
        if (!style) {
          return
        }
        const normalized = normalizeUniAppXImportantApplyForSass(style.source)
        return normalized === style.source ? undefined : { code: normalized, map: null }
      },
    },
    async transform(code, id) {
      if (!isEnabled()) {
        return
      }
      await runtimeState.readyPromise
      const { filename, query } = parseVueRequest(id)
      if (query.vue && query.type === 'style') {
        await pendingSfcTransforms.get(cleanUrl(filename))
      }
      const resolvedSource = resolveUniAppXStyleSource(code, query)
      if (resolvedSource.skip) {
        return
      }
      const styleCode = query.vue && query.type === 'style' ? webLocalStyle.appendToStyle(resolvedSource.code, id) : resolvedSource.code
      // Vite 热更新会绕过 SFC 主模块，直接把原始样式交给预处理器；先移除
      // Sass 无法解析的 important utility 后，再由后续 CSS 阶段还原。
      const preprocessorCode = query.vue && query.type === 'style'
        ? normalizeUniAppXImportantApplyForSass(styleCode)
        : styleCode
      const preprocessor = resolvePreprocessorTransform(preprocessorCode, id, query.lang, {
        isIosPlatform,
        isNativeAppStyleTarget: isNativeAppStyleTarget(),
      })
      if (preprocessor) {
        return preprocessor.result ?? (preprocessorCode !== code ? { code: preprocessorCode, map: null } : undefined)
      }
      return transformStyle(preprocessorCode, id, query, this)
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

  async function transformSfc(code: string, id: string, context: { addWatchFile?: (id: string) => void }) {
    knownSfcSources.set(cleanUrl(id), code)
    if (isWebGeneratorTarget()) {
      for (const style of extractSfcStyleBlocks(code)) {
        webCssEntryDiagnostics?.observeSourceImports(style.source, id)
      }
    }
    if (isNativeAppBuildTarget(id)) {
      nativeLocalStyleModuleIds.add(id)
      nativeLocalStyleModuleIds.add(cleanUrl(id))
    }
    harmonyApply.rememberSource(code, id, true)
    const enableComponentLocalStyle = shouldEnableComponentLocalStyle()
    const enablePageLocalStyle = shouldEnablePageLocalStyleForFile(id)
    const resolvedConfig = getResolvedConfig()
    const shouldForceRefresh = resolvedConfig?.command === 'serve' || resolvedConfig?.command === 'build'
    const moduleGraphCandidates = enableComponentLocalStyle || enablePageLocalStyle
      ? await registerModuleGraphCandidates?.(id, code)
      : undefined
    const runtimeSet = await ensureRuntimeClassSet(shouldForceRefresh)
    const currentRuntimeSet: Set<string> = moduleGraphCandidates?.size
      ? new Set([...runtimeSet, ...moduleGraphCandidates])
      : runtimeSet
    nativeHmrReloader.remember(currentRuntimeSet)
    const transformUVue = await loadTransformUVue()
    const transformOptions = omitUndefined({
      componentMatcher: resolvedUniAppXOptions.componentLocalStyles.componentMatcher,
      ...(customAttributesEntities.length > 0 ? { customAttributesEntities } : {}),
      ...(disabledDefaultTemplateHandler ? { disabledDefaultTemplateHandler } : {}),
      ...(enableComponentLocalStyle ? { enableComponentLocalStyle } : {}),
      ...(enablePageLocalStyle ? { enablePageLocalStyle } : {}),
      native: true,
      pageMatcher: resolvedUniAppXOptions.componentLocalStyles.pageMatcher,
      ...(isWebGeneratorTarget() && customAttributesEntities.length > 0 ? { webCustomAttributeDeep: true } : {}),
      ...(isWebGeneratorTarget()
        ? {
            onWebLocalStyleRules: (rules: string) => {
              webLocalStyle.remember(id, rules)
              webCssEntryDiagnostics?.requestCheck()
            },
          }
        : {}),
    })
    const result = Object.keys(transformOptions).length > 0
      ? transformUVue(code, id, jsHandler, currentRuntimeSet, transformOptions)
      : transformUVue(code, id, jsHandler, currentRuntimeSet)
    if (!result?.code) {
      return result
    }
    harmonyApply.rememberSource(result.code, id)
    const expandedCode = await harmonyApply.expandStyles(result.code, id, context)
    return expandedCode === result.code ? result : { code: expandedCode, map: null }
  }

  function runTransformSfc(code: string, id: string, context: { addWatchFile?: (id: string) => void }) {
    const file = cleanUrl(id)
    const pending = transformSfc(code, id, context)
    pendingSfcTransforms.set(file, pending)
    void pending.finally(() => {
      if (pendingSfcTransforms.get(file) === pending) {
        pendingSfcTransforms.delete(file)
      }
    })
    return pending
  }

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
        return runTransformSfc(code, id, this)
      },
    },
    handleHotUpdate: {
      order: 'post',
      async handler(ctx) {
        if (!isEnabled() || getResolvedConfig()?.command !== 'serve') {
          return
        }
        if (!UVUE_NVUE_RE.test(ctx.file) && !isCSSRequest(ctx.file)) {
          return
        }
        if (isWebGeneratorTarget() && UVUE_NVUE_RE.test(ctx.file) && typeof ctx.read === 'function') {
          // 完整 SFC 更新会取代此前可能排队的 CSS HMR 事务，避免版本过滤器
          // 把当前样式模块误判为旧事务而丢弃。
          hmrCssModuleVersions?.clear()
          const source = await ctx.read()
          if (hasUniAppXImportantApply(source, normalizeUniAppXImportantApplyForSass)) {
            ctx.server.ws.send({ type: 'full-reload', path: ctx.file })
            return []
          }
          await runTransformSfc(source, ctx.file, this)
        }
        return webLocalStyle.handleHotUpdate(ctx) ?? nativeHmrReloader.handleHotUpdate(ctx)
      },
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
    buildEnd() {
      if (isWebGeneratorTarget()) {
        webCssEntryDiagnostics?.flush()
      }
    },
    closeBundle() {
      webCssEntryDiagnostics?.dispose()
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
            componentMatcher: resolvedUniAppXOptions.componentLocalStyles.componentMatcher,
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
