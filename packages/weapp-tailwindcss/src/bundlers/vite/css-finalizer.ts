import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { normalizeStyleHandlerMajorVersion } from '@/context/style-options'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch, shouldUseMiniProgramCssBranch } from '@/runtime-branch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { collectUniAppXHarmonyApplyStyleSources, collectUniAppXHarmonyApplyUtilities, createUniAppXHarmonyApplyGeneratorSource, injectUniAppXHarmonyBundleStyles, isUniAppXHarmonyBundle } from '@/uni-app-x/style-asset'
import { resolveUniUtsPlatform } from '@/utils'
import { annotateCssSourceTrace, createCssTokenSourceMap } from '../shared/css-source-trace'
import { stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { hasTailwindGeneratedCssMarkers } from '../shared/generator-css'
import { hasLocalCssImport, hasTailwindApplyDirective, hasTailwindRootDirectives } from '../shared/generator-css/directives'
import { generateTailwindV4Css } from '../shared/v4-generation-core'
import { resolveMiniProgramStyleOutputExtension, resolveViteCssPipelineOutputFile } from './generate-bundle'
import { normalizeTaroRootImportShellAssets } from './generate-bundle/finalize'
import { collectViteProcessedCssAssetResults, injectViteProcessedCssIntoMainCssAssets } from './processed-css-assets'
import { resolveUniAppXNativeCssHandlerOptions } from './uni-app-x-css-options'
import { isHTMLRequest } from './utils'
import { resolveSourceRootFromBundleGraph, resolveWeappViteSourceRoot } from './weapp-vite-config'

interface RememberedMainCssSource {
  rawSource: string
  sourceFile: string
}

interface CssFinalizerContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    tailwindRuntime: InternalUserDefinedOptions['tailwindRuntime']
    readyPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  isCssAssetProcessed: (asset: OutputAsset, file?: string) => boolean
  markCssAssetProcessed: (asset: OutputAsset, file?: string) => void
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
  recordCssAssetResult?: (file: string, css: string) => void
  recordViteProcessedCssAssetResult?: (file: string, css: string, options?: { injectIntoMain?: boolean | undefined, outputFile?: string | undefined }) => void
  getViteProcessedCssAssetResults?: () => Iterable<[string, string | { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }]>
  getRecordedGeneratorCandidates?: () => Set<string> | undefined
  getSourceCandidates?: () => Set<string>
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  getSourceCandidateSourcesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Map<string, Set<string>>) | undefined
  waitForSourceCandidateSyncs?: () => Promise<void>
  rememberMainCssSource?: (file: string, rawSource: string) => void
  getRememberedMainCssSource?: (file: string) => RememberedMainCssSource | undefined
  isViteProcessedCssAsset?: (asset: OutputAsset, file?: string) => boolean
}

interface CssFinalizerThis {
  addWatchFile?: (id: string) => void
}

function isAddWatchFileInvalidRollupPhaseError(error: unknown) {
  const candidate = error as { code?: string, pluginCode?: string, message?: string }
  return candidate?.code === 'INVALID_ROLLUP_PHASE'
    || candidate?.pluginCode === 'INVALID_ROLLUP_PHASE'
    || candidate?.message?.includes('Cannot call "addWatchFile" after the build has finished.') === true
}

function registerGeneratorDependencies(ctx: CssFinalizerThis, dependencies: readonly string[] | undefined) {
  if (typeof ctx.addWatchFile !== 'function') {
    return
  }
  for (const dependency of dependencies ?? []) {
    try {
      ctx.addWatchFile(dependency)
    }
    catch (error) {
      if (isAddWatchFileInvalidRollupPhaseError(error)) {
        logger.debug('跳过生成模式依赖监听注册，当前 Rollup 阶段不允许 addWatchFile: %s', dependency)
        continue
      }
      throw error
    }
  }
}

function createCssHandlerOptions(
  opts: InternalUserDefinedOptions,
  majorVersion: number | undefined,
  file: string,
): IStyleHandlerOptions {
  return {
    ...resolveUniAppXNativeCssHandlerOptions(opts),
    isMainChunk: opts.mainCssChunkMatcher(file, opts.appType),
    postcssOptions: {
      options: {
        from: file,
      },
    },
    ...(normalizeStyleHandlerMajorVersion(majorVersion) === undefined ? {} : { majorVersion: 4 as const }),
  }
}

function shouldGenerateCssByGenerator(
  opts: InternalUserDefinedOptions,
  majorVersion: number | undefined,
  file: string,
  rawSource: string,
  processed: boolean,
) {
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
    appType: opts.appType,
    platform: opts.cssOptions?.platform ?? opts.platform,
    tailwindcssMajorVersion: majorVersion,
    uniAppX: opts.uniAppX,
  })
  if (hasLocalCssImport(rawSource)) {
    return false
  }
  if (hasTailwindGeneratedCssMarkers(rawSource)) {
    return true
  }
  if (hasTailwindRootDirectives(rawSource, { importFallback: generatorOptions.importFallback })) {
    return true
  }
  return processed
    && hasTailwindApplyDirective(rawSource)
    && shouldFinalizeProcessedCssAsset(opts, file)
}

function shouldFinalizeProcessedCssAsset(
  opts: InternalUserDefinedOptions,
  file: string,
) {
  return opts.mainCssChunkMatcher(file, opts.appType)
}

function collectViteProcessedCssSources(
  getViteProcessedCssAssetResults: CssFinalizerContext['getViteProcessedCssAssetResults'],
) {
  return [...(getViteProcessedCssAssetResults?.() ?? [])]
    .map(([, record]) => typeof record === 'string' ? record : record.css)
}

export function createViteCssFinalizerOutputPlugin(context: CssFinalizerContext): Plugin {
  return {
    name: 'weapp-tailwindcss:adaptor:css-finalizer',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      async handler(this: CssFinalizerThis, _options, bundle: OutputBundle) {
        const {
          opts,
          runtimeState,
          ensureRuntimeClassSet,
          isCssAssetProcessed,
          markCssAssetProcessed,
          debug,
          getResolvedConfig,
          recordCssAssetResult,
          recordViteProcessedCssAssetResult,
          getViteProcessedCssAssetResults,
          getRecordedGeneratorCandidates,
          getSourceCandidates,
          getSourceCandidatesForEntries,
          getSourceCandidateSourcesForEntries,
          waitForSourceCandidateSyncs,
          rememberMainCssSource,
          getRememberedMainCssSource,
          isViteProcessedCssAsset,
        } = context
        const resolvedConfig = getResolvedConfig()
        const uniUtsPlatform = resolveUniUtsPlatform()
        const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
          appType: opts.appType,
          platform: opts.cssOptions?.platform ?? opts.platform,
          tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
          uniAppX: opts.uniAppX,
          uniUtsPlatform,
        })
        const generatorBranch = resolveGeneratorRuntimeBranch(generatorOptions, {
          appType: opts.appType,
          platform: opts.cssOptions?.platform ?? opts.platform,
          tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
          uniAppX: opts.uniAppX,
          uniUtsPlatform,
        })
        const isWebGeneratorTarget = generatorBranch.isWeb
        const canInferHarmonyAppStyleTarget = !uniUtsPlatform.normalized || uniUtsPlatform.isApp
        const isHarmonyAppStyleTarget = uniUtsPlatform.isAppHarmony || (
          canInferHarmonyAppStyleTarget
          && (isUniAppXHarmonyBundle(bundle) || isUniAppXHarmonyOutDir(resolvedConfig?.build?.outDir))
        )
        const isNativeAppStyleTarget = uniUtsPlatform.isApp || isHarmonyAppStyleTarget
        if (resolvedConfig?.command !== 'build' && !isNativeAppStyleTarget) {
          return
        }
        const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
        const sourceRoot = resolveWeappViteSourceRoot(resolvedConfig, opts.appType)
          ?? resolveSourceRootFromBundleGraph(resolvedConfig, bundle)
        const sourceTraceTokenSources = getSourceCandidateSourcesForEntries
          ? createCssTokenSourceMap(getSourceCandidateSourcesForEntries(undefined), opts)
          : undefined
        const annotateCss = (css: string) => annotateCssSourceTrace(css, {
          opts,
          tokenSources: sourceTraceTokenSources,
        })

        const collectViteProcessedCssAssets = () => {
          collectViteProcessedCssAssetResults(bundle, {
            opts,
            isViteProcessedCssAsset,
            markCssAssetProcessed,
            recordCssAssetResult,
            recordViteProcessedCssAssetResult,
            resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, isNativeAppStyleTarget, sourceRoot, resolveMiniProgramStyleOutputExtension({
              files: Object.keys(bundle),
            }), Object.keys(bundle)),
            debug,
          })
        }

        const injectViteProcessedCssIntoMainCss = () => {
          return injectViteProcessedCssIntoMainCssAssets(bundle, {
            opts,
            getViteProcessedCssAssetResults,
            markCssAssetProcessed,
            recordCssAssetResult,
            debug,
            onUpdate: opts.onUpdate,
          })
        }

        collectViteProcessedCssAssets()

        const createHarmonyBundleStyleSources = async (runtime: Set<string>) => {
          const cssSources = collectViteProcessedCssSources(getViteProcessedCssAssetResults)
          const applyUtilities = collectUniAppXHarmonyApplyUtilities(bundle)
          const applyStyleSources = collectUniAppXHarmonyApplyStyleSources(bundle)
          if (applyUtilities.size === 0 || applyStyleSources.length === 0) {
            return cssSources
          }
          const harmonyRuntime = new Set([
            ...runtime,
            ...applyUtilities,
          ])
          const harmonyCssHandlerOptions = createCssHandlerOptions(opts, runtimeState.tailwindRuntime.majorVersion, 'uni-app-x-harmony-apply.css')
          const generated = await generateTailwindV4Css({
            opts,
            runtimeState,
            runtime: harmonyRuntime,
            rawSource: createUniAppXHarmonyApplyGeneratorSource(applyStyleSources, applyUtilities),
            file: 'uni-app-x-harmony-apply.css',
            outputFile: 'uni-app-x-harmony-apply.css',
            cssHandlerOptions: harmonyCssHandlerOptions,
            cssUserHandlerOptions: {
              ...harmonyCssHandlerOptions,
              isMainChunk: false,
            },
            getSourceCandidatesForEntries,
            styleHandler: opts.styleHandler,
            debug,
          })
          if (generated?.css) {
            cssSources.push(annotateCss(generated.css))
          }
          return cssSources
        }

        const injectHarmonyBundleStyles = async (runtime: Set<string>) => {
          if (!isHarmonyAppStyleTarget) {
            return
          }
          const changed = injectUniAppXHarmonyBundleStyles(bundle, {
            cssSources: await createHarmonyBundleStyleSources(runtime),
          })
          if (changed) {
            debug('uni-app-x harmony bundle styles inject')
          }
        }

        const isCssOutputAssetEntry = (
          entry: [string, OutputAsset | OutputChunk],
        ): entry is [string, OutputAsset] => {
          const [bundleFile, output] = entry
          const fileName = output.fileName || bundleFile
          return (
            output.type === 'asset'
            && opts.cssMatcher(fileName)
            && !opts.htmlMatcher(fileName)
            && !isHTMLRequest(fileName)
            && !isCssAssetProcessed(output, fileName)
          )
        }

        const entries = Object.entries(bundle).filter(isCssOutputAssetEntry)

        if (entries.length === 0) {
          const runtime = getRecordedGeneratorCandidates?.() ?? getSourceCandidates?.() ?? await ensureRuntimeClassSet()
          await injectHarmonyBundleStyles(runtime)
          collectViteProcessedCssAssets()
          injectViteProcessedCssIntoMainCss()
          normalizeTaroRootImportShellAssets(bundle, {
            appType: opts.appType,
            cssMatcher: opts.cssMatcher,
            debug,
            onUpdate: opts.onUpdate,
            recordCssAssetResult,
          })
          return
        }

        await runtimeState.readyPromise
        await waitForSourceCandidateSyncs?.()
        const runtime = getRecordedGeneratorCandidates?.() ?? getSourceCandidates?.() ?? await ensureRuntimeClassSet()
        const collectedGeneratorCandidates = new Set([
          ...runtime,
          ...(getSourceCandidates?.() ?? []),
        ])
        const generatorRuntime = shouldUseMiniProgramCssBranch(generatorBranch)
          ? filterUnsupportedMiniProgramTailwindV4Candidates(collectedGeneratorCandidates)
          : collectedGeneratorCandidates
        await Promise.all(entries.map(async ([bundleFile, output]) => {
          const file = output.fileName || bundleFile
          const rawSource = output.source.toString()
          if (isViteProcessedCssAsset?.(output, file)) {
            const nextCss = annotateCss(stripBundlerGeneratedCssMarkers(rawSource))
            output.source = nextCss
            markCssAssetProcessed(output, file)
            recordCssAssetResult?.(file, nextCss)
            debug('css finalizer skip vite-processed css: %s', file)
            return
          }
          const cssHandlerOptions = createCssHandlerOptions(
            opts,
            runtimeState.tailwindRuntime.majorVersion,
            file,
          )
          const cssUserHandlerOptions = {
            ...cssHandlerOptions,
            isMainChunk: false,
          }
          const processed = isCssAssetProcessed(output, file)
          const rememberedMainCssSource = processed && cssHandlerOptions.isMainChunk
            ? getRememberedMainCssSource?.(file)
            : undefined
          const generatorRawSource = rememberedMainCssSource?.rawSource ?? rawSource
          const generatorSourceFile = rememberedMainCssSource?.sourceFile ?? file
          const generatorCssHandlerOptions = rememberedMainCssSource
            ? createCssHandlerOptions(
                opts,
                runtimeState.tailwindRuntime.majorVersion,
                generatorSourceFile,
              )
            : cssHandlerOptions
          const generatorCssUserHandlerOptions = rememberedMainCssSource
            ? {
                ...generatorCssHandlerOptions,
                isMainChunk: false,
              }
            : cssUserHandlerOptions
          const generated = shouldGenerateCssByGenerator(opts, runtimeState.tailwindRuntime.majorVersion, file, generatorRawSource, processed)
            ? await generateTailwindV4Css({
                opts,
                runtimeState,
                runtime: generatorRuntime,
                rawSource: generatorRawSource,
                file: generatorSourceFile,
                outputFile: file,
                cssHandlerOptions: generatorCssHandlerOptions,
                cssUserHandlerOptions: generatorCssUserHandlerOptions,
                getSourceCandidatesForEntries,
                styleHandler: opts.styleHandler,
                debug,
              })
            : undefined
          const nextCss = annotateCss(generated?.css ?? (
            generatorBranch.isWeb
              ? rawSource
              : (await opts.styleHandler(rawSource, cssHandlerOptions)).css
          ))
          if (generated) {
            registerGeneratorDependencies(this, generated.dependencies)
            debug('css finalizer generated result: %s bytes=%d', file, nextCss.length)
            recordCssAssetResult?.(file, nextCss)
            if (cssHandlerOptions.isMainChunk) {
              rememberMainCssSource?.(file, generatorRawSource)
            }
          }
          output.source = nextCss
          markCssAssetProcessed(output, file)
          opts.onUpdate(file, rawSource, nextCss)
          debug('css finalizer handle: %s', file)
        }))
        await injectHarmonyBundleStyles(generatorRuntime)
        collectViteProcessedCssAssets()
        injectViteProcessedCssIntoMainCss()
        normalizeTaroRootImportShellAssets(bundle, {
          appType: opts.appType,
          cssMatcher: opts.cssMatcher,
          debug,
          onUpdate: opts.onUpdate,
          recordCssAssetResult,
        })
      },
    },
  }
}
