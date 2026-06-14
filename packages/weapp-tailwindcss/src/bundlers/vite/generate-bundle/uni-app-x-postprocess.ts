import type { OutputAsset, OutputChunk } from 'rollup'
import type { CssHandlerOptionsCache } from './css-handler-options'
import type { GenerateBundleContext } from './types'
import { collectUniAppXHarmonyApplyStyleSources, collectUniAppXHarmonyApplyUtilities, createUniAppXBundleAssetSourceGetter, createUniAppXHarmonyApplyGeneratorSource, injectUniAppXHarmonyBundleStyles, injectUniAppXStylePlaceholder } from '@/uni-app-x/style-asset'
import { annotateCssSourceTrace, createCssTokenSourceMap } from '../../shared/css-source-trace'
import { generateCssByGenerator } from '../../shared/generator-css'

interface HandleUniAppXPostCssOptions {
  bundle: Record<string, OutputAsset | OutputChunk>
  debug: GenerateBundleContext['debug']
  generatorRuntime: Set<string>
  getCssHandlerOptions: CssHandlerOptionsCache['getCssHandlerOptions']
  getSourceCandidateSourcesForEntries: GenerateBundleContext['getSourceCandidateSourcesForEntries']
  getSourceCandidatesForEntries: GenerateBundleContext['getSourceCandidatesForEntries']
  getViteProcessedCssAssetResults: GenerateBundleContext['getViteProcessedCssAssetResults']
  isHarmonyAppStyleTarget: boolean
  isNativeAppStyleTarget: boolean
  onUpdate: GenerateBundleContext['opts']['onUpdate']
  opts: GenerateBundleContext['opts']
  runtimeState: GenerateBundleContext['runtimeState']
  styleHandler: GenerateBundleContext['opts']['styleHandler']
}

export async function handleUniAppXPostCssTasks(options: HandleUniAppXPostCssOptions) {
  const {
    bundle,
    debug,
    generatorRuntime,
    getCssHandlerOptions,
    getSourceCandidateSourcesForEntries,
    getSourceCandidatesForEntries,
    getViteProcessedCssAssetResults,
    isHarmonyAppStyleTarget,
    isNativeAppStyleTarget,
    onUpdate,
    opts,
    runtimeState,
    styleHandler,
  } = options
  const applyStyleSources = collectUniAppXHarmonyApplyStyleSources(bundle)
  if (opts.appType !== 'uni-app-x' && !isNativeAppStyleTarget && !isHarmonyAppStyleTarget) {
    return applyStyleSources
  }

  const getAssetSource = createUniAppXBundleAssetSourceGetter(bundle)
  const viteProcessedCssSources = [...(getViteProcessedCssAssetResults?.() ?? [])]
    .map(([, record]) => typeof record === 'string' ? record : record.css)
  const applyUtilities = collectUniAppXHarmonyApplyUtilities(bundle)
  if (isHarmonyAppStyleTarget && applyUtilities.size > 0 && applyStyleSources.length > 0) {
    const outputFile = 'uni-app-x-harmony-apply.css'
    const cssHandlerOptions = getCssHandlerOptions(outputFile)
    const generated = await generateCssByGenerator({
      opts,
      runtimeState,
      runtime: new Set([
        ...generatorRuntime,
        ...applyUtilities,
      ]),
      rawSource: createUniAppXHarmonyApplyGeneratorSource(applyStyleSources, applyUtilities),
      file: outputFile,
      cssHandlerOptions,
      cssUserHandlerOptions: {
        ...cssHandlerOptions,
        isMainChunk: false,
      },
      getSourceCandidatesForEntries,
      styleHandler,
      debug,
    })
    if (generated?.css) {
      viteProcessedCssSources.push(annotateCssSourceTrace(generated.css, {
        opts,
        tokenSources: getSourceCandidateSourcesForEntries
          ? createCssTokenSourceMap(getSourceCandidateSourcesForEntries(undefined), opts)
          : undefined,
      }))
    }
  }
  if (isHarmonyAppStyleTarget && injectUniAppXHarmonyBundleStyles(bundle, { cssSources: viteProcessedCssSources })) {
    debug('uni-app-x harmony bundle styles inject')
  }
  for (const [file, item] of Object.entries(bundle)) {
    if (item.type !== 'asset' || !file.endsWith('.uvue.ts')) {
      continue
    }
    const currentSource = String(item.source)
    const nextSource = injectUniAppXStylePlaceholder(file, currentSource, getAssetSource)
    if (nextSource !== currentSource) {
      item.source = nextSource
      onUpdate(file, currentSource, nextSource)
      debug('uni-app-x style placeholder inject: %s', file)
    }
  }
  return applyStyleSources
}
