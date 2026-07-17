import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup'
import type { Plugin } from 'vite'
import type { ViteFrameworkCssPipelineContext } from '../shared/framework-strategy'
import type { CssFinalizerContext, CssFinalizerThis } from './options'
import path from 'node:path'
import process from 'node:process'
import { AssetEmissionPlan } from '@/compiler'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch, shouldUseMiniProgramCssBranch } from '@/runtime-branch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { collectUniAppXHarmonyApplyStyleSources, collectUniAppXHarmonyApplyUtilities, createUniAppXHarmonyApplyGeneratorSource, injectUniAppXHarmonyBundleStyles } from '@/uni-app-x/style-asset'
import { resolveUniUtsPlatform } from '@/utils'
import { annotateCssSourceTrace, createCssTokenSourceMap } from '../../shared/css-source-trace'
import { stripBundlerGeneratedCssMarkers } from '../../shared/generated-css-marker'
import { isPureLocalCssImportWrapper } from '../../shared/generator-css/local-imports'
import { normalizeMiniProgramGeneratorCssSource } from '../../shared/generator-css/output-import-shell'
import { generateTailwindV4Css } from '../../shared/v4-generation-core'
import { resolveMiniProgramStyleOutputExtension, resolveViteCssPipelineOutputFile } from '../generate-bundle'
import { applyViteAssetEmissionPlan } from '../generate-bundle/asset-emission-plan'
import { normalizeRootMiniProgramImportShellAssets } from '../generate-bundle/finalize'
import { restoreFrameworkRootMiniProgramImportShellAssets } from '../generate-bundle/root-style-output'
import { collectViteProcessedCssAssetResults, injectViteProcessedCssIntoMainCssAssets } from '../processed-css-assets'
import { isHTMLRequest } from '../utils'
import { resolveSourceRootFromBundleGraph, resolveWeappViteSourceRoot } from '../weapp-vite-config'
import { collectViteProcessedCssSources, createCssHandlerOptions, finalizeWebCss, inferPlatformFromViteOutDir, registerGeneratorDependencies, shouldGenerateCssByGenerator } from './options'

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
          cssPipelineStrategy,
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
          frameworkRootImportShellTargetByFile,
        } = context
        const resolvedConfig = getResolvedConfig()
        const uniUtsPlatform = resolveUniUtsPlatform()
        const generatorPlatform = opts.cssOptions?.platform
          ?? opts.platform
          ?? inferPlatformFromViteOutDir(resolvedConfig?.build?.outDir)
        const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
          appType: opts.appType,
          platform: generatorPlatform,
          tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
          uniAppX: opts.uniAppX,
          uniUtsPlatform,
        })
        const generatorBranch = resolveGeneratorRuntimeBranch(generatorOptions, {
          appType: opts.appType,
          platform: generatorPlatform,
          tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
          uniAppX: opts.uniAppX,
          uniUtsPlatform,
        })
        const isWebGeneratorTarget = generatorBranch.isWeb
        const createCssPipelineContext = (_file: string): ViteFrameworkCssPipelineContext => ({
          bundle,
          currentGeneratorBranch: generatorBranch,
          currentGeneratorOptions: generatorOptions,
          opts,
          resolvedConfig,
          resolveStylePlatform: () => generatorPlatform,
        })
        const isHarmonyAppStyleTarget = cssPipelineStrategy?.isHarmonyAppStyleTarget?.(createCssPipelineContext('')) === true
        const isNativeAppStyleTarget = cssPipelineStrategy?.isNativeAppStyleTarget?.(createCssPipelineContext('')) === true
        if (resolvedConfig?.command !== 'build' && !isNativeAppStyleTarget) {
          return
        }
        const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
        const outDir = resolvedConfig?.build?.outDir
          ? path.resolve(rootDir, resolvedConfig.build.outDir)
          : rootDir
        const sourceRoot = resolveWeappViteSourceRoot(resolvedConfig, opts.appType)
          ?? resolveSourceRootFromBundleGraph(resolvedConfig, bundle)
        restoreFrameworkRootMiniProgramImportShellAssets(bundle, {
          debug,
          isWebGeneratorTarget,
          matchesCss: opts.cssMatcher,
          onUpdate: opts.onUpdate,
          recordCssAssetResult,
          shouldKeep: (file, css) => cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
            ...createCssPipelineContext(file),
            css,
            file,
          }),
          targetByFile: frameworkRootImportShellTargetByFile ?? new Map(),
        })
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
            cssPipelineStrategy,
            createCssPipelineContext,
            isViteProcessedCssAsset,
            markCssAssetProcessed,
            recordCssAssetResult,
            recordViteProcessedCssAssetResult,
            resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, isNativeAppStyleTarget, sourceRoot, resolveMiniProgramStyleOutputExtension({
              files: Object.keys(bundle),
            }), Object.keys(bundle)),
            transformCss: (css, file) => finalizeWebCss(css, {
              ...createCssPipelineContext(file),
              file,
            }, cssPipelineStrategy),
            debug,
          })
        }

        const injectViteProcessedCssIntoMainCss = () => {
          return injectViteProcessedCssIntoMainCssAssets(bundle, {
            opts,
            cssPipelineStrategy,
            createCssPipelineContext,
            getViteProcessedCssAssetResults,
            markCssAssetProcessed,
            recordCssAssetResult,
            transformCss: (css, file) => finalizeWebCss(css, {
              ...createCssPipelineContext(file),
              file,
            }, cssPipelineStrategy),
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
          const harmonyCssHandlerOptions = createCssHandlerOptions(
            opts,
            runtimeState.tailwindRuntime.majorVersion,
            'uni-app-x-harmony-apply.css',
            outDir,
            cssPipelineStrategy?.getCssHandlerExtraOptions?.({
              ...createCssPipelineContext('uni-app-x-harmony-apply.css'),
              file: 'uni-app-x-harmony-apply.css',
            }) ?? {},
          )
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
            cssStage: 'framework-processed',
            getSourceCandidatesForEntries,
            generatorPlatform,
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
          normalizeRootMiniProgramImportShellAssets(bundle, {
            cssMatcher: opts.cssMatcher,
            debug,
            enabled: cssPipelineStrategy?.shouldNormalizeRootMiniProgramImportShell?.(createCssPipelineContext('')) === true,
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
        const emissionPlan = new AssetEmissionPlan()
        const writeTargets = new Map<string, OutputAsset>()
        const writeCssAsset = (file: string, output: OutputAsset, source: string) => {
          emissionPlan.write(file, source)
          writeTargets.set(file, output)
        }
        await Promise.all(entries.map(async ([bundleFile, output]) => {
          const file = output.fileName || bundleFile
          const rawSource = output.source.toString()
          if (isViteProcessedCssAsset?.(output, file)) {
            const cleanRawSource = stripBundlerGeneratedCssMarkers(rawSource)
            const cssHandlerOptions = createCssHandlerOptions(
              opts,
              runtimeState.tailwindRuntime.majorVersion,
              file,
              outDir,
              cssPipelineStrategy?.getCssHandlerExtraOptions?.({
                ...createCssPipelineContext(file),
                file,
              }) ?? {},
            )
            const nextCss = annotateCss(generatorBranch.isWeb
              ? finalizeWebCss(
                  cleanRawSource,
                  {
                    ...createCssPipelineContext(file),
                    file,
                  },
                  cssPipelineStrategy,
                )
              : (await opts.styleHandler(cleanRawSource, cssHandlerOptions)).css)
            writeCssAsset(file, output, nextCss)
            markCssAssetProcessed(output, file)
            recordCssAssetResult?.(file, nextCss)
            debug('css finalizer skip vite-processed css: %s', file)
            return
          }
          const cssHandlerOptions = createCssHandlerOptions(
            opts,
            runtimeState.tailwindRuntime.majorVersion,
            file,
            outDir,
            cssPipelineStrategy?.getCssHandlerExtraOptions?.({
              ...createCssPipelineContext(file),
              file,
            }) ?? {},
          )
          const cssUserHandlerOptions = {
            ...cssHandlerOptions,
            isMainChunk: false,
          }
          const cleanRawSource = stripBundlerGeneratedCssMarkers(rawSource)
          if (cleanRawSource !== rawSource && cleanRawSource.trim().length === 0) {
            writeCssAsset(file, output, cleanRawSource)
            markCssAssetProcessed(output, file)
            recordCssAssetResult?.(file, cleanRawSource)
            opts.onUpdate(file, rawSource, cleanRawSource)
            debug('css finalizer strip empty marker asset: %s', file)
            return
          }
          const processed = isCssAssetProcessed(output, file)
          const rememberedMainCssSource = processed && cssHandlerOptions.isMainChunk
            ? getRememberedMainCssSource?.(file)
            : undefined
          const resolvedGeneratorRawSource = rememberedMainCssSource?.rawSource ?? cleanRawSource
          const generatorRawSource = generatorBranch.isWeb
            ? resolvedGeneratorRawSource
            : normalizeMiniProgramGeneratorCssSource(resolvedGeneratorRawSource, file)
          const generatorSourceFile = rememberedMainCssSource?.sourceFile ?? file
          const generatorCssHandlerOptions = rememberedMainCssSource
            ? createCssHandlerOptions(
                opts,
                runtimeState.tailwindRuntime.majorVersion,
                generatorSourceFile,
                outDir,
                cssPipelineStrategy?.getCssHandlerExtraOptions?.({
                  ...createCssPipelineContext(generatorSourceFile),
                  file: generatorSourceFile,
                }) ?? {},
              )
            : cssHandlerOptions
          const generatorCssUserHandlerOptions = rememberedMainCssSource
            ? {
                ...generatorCssHandlerOptions,
                isMainChunk: false,
              }
            : cssUserHandlerOptions
          const generatorTransformRawSource = generatorRawSource
          const generated = shouldGenerateCssByGenerator(opts, runtimeState.tailwindRuntime.majorVersion, file, generatorTransformRawSource, processed)
            ? await generateTailwindV4Css({
                opts,
                runtimeState,
                runtime: generatorRuntime,
                rawSource: generatorTransformRawSource,
                file: generatorSourceFile,
                outputFile: file,
                cssHandlerOptions: generatorCssHandlerOptions,
                cssUserHandlerOptions: generatorCssUserHandlerOptions,
                cssStage: 'framework-processed',
                getSourceCandidatesForEntries,
                generatorPlatform,
                styleHandler: opts.styleHandler,
                debug,
              })
            : undefined
          if (!generated && !generatorBranch.isWeb && isPureLocalCssImportWrapper(generatorTransformRawSource)) {
            const nextCss = generatorTransformRawSource
            if (nextCss !== rawSource) {
              writeCssAsset(file, output, nextCss)
              opts.onUpdate(file, rawSource, nextCss)
            }
            markCssAssetProcessed(output, file)
            recordCssAssetResult?.(file, nextCss)
            debug('css finalizer preserve mini-program import shell: %s', file)
            return
          }
          const nextCss = annotateCss(generated?.css ?? (
            generatorBranch.isWeb
              ? finalizeWebCss(cleanRawSource, {
                  ...createCssPipelineContext(file),
                  file,
                }, cssPipelineStrategy)
              : (await opts.styleHandler(generatorTransformRawSource, cssHandlerOptions)).css
          ))
          if (generated) {
            registerGeneratorDependencies(this, generated.dependencies)
            debug('css finalizer generated result: %s bytes=%d', file, nextCss.length)
            recordCssAssetResult?.(file, nextCss)
            if (cssHandlerOptions.isMainChunk) {
              rememberMainCssSource?.(file, generatorRawSource)
            }
          }
          writeCssAsset(file, output, nextCss)
          markCssAssetProcessed(output, file)
          opts.onUpdate(file, rawSource, nextCss)
          debug('css finalizer handle: %s', file)
        }))
        applyViteAssetEmissionPlan(emissionPlan, {
          bundle,
          writeTargets,
        })
        await injectHarmonyBundleStyles(generatorRuntime)
        collectViteProcessedCssAssets()
        injectViteProcessedCssIntoMainCss()
        normalizeRootMiniProgramImportShellAssets(bundle, {
          cssMatcher: opts.cssMatcher,
          debug,
          enabled: cssPipelineStrategy?.shouldNormalizeRootMiniProgramImportShell?.(createCssPipelineContext('')) === true,
          onUpdate: opts.onUpdate,
          recordCssAssetResult,
        })
      },
    },
  }
}
