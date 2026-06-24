import type { OutputAsset, OutputChunk } from 'rollup'
import type { GenerateBundleContext } from './types'
import type { IStyleHandlerOptions } from '@/types'
import {
  hasMiniProgramCssSpecificityPlaceholders,
  stripMiniProgramCssSpecificityPlaceholders,
} from '@/bundlers/shared/css-cleanup'

function readAssetSource(output: OutputAsset) {
  return typeof output.source === 'string'
    ? output.source
    : output.source.toString()
}

function shouldFinalizeMiniProgramCssAsset(source: string) {
  return source.includes(':hover')
    || source.includes('does-not-exist')
    || hasMiniProgramCssSpecificityPlaceholders(source)
}

export async function finalizeMiniProgramCssAssets(
  bundle: Record<string, OutputAsset | OutputChunk>,
  options: {
    cssMatcher: GenerateBundleContext['opts']['cssMatcher']
    getCssHandlerOptions: (file: string) => IStyleHandlerOptions
    isWebGeneratorTarget: boolean
    lastCssResultByFile?: Map<string, string> | undefined
    onUpdate: GenerateBundleContext['opts']['onUpdate']
    recordCssAssetResult: GenerateBundleContext['recordCssAssetResult']
    styleHandler: GenerateBundleContext['opts']['styleHandler']
    debug?: GenerateBundleContext['debug']
  },
) {
  if (options.isWebGeneratorTarget) {
    return 0
  }

  let updated = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = output.fileName || bundleFile
    if (!options.cssMatcher(file)) {
      continue
    }

    const rawSource = readAssetSource(output)
    if (rawSource.trim().length === 0) {
      continue
    }
    if (options.lastCssResultByFile?.has(file)) {
      const outputCss = stripMiniProgramCssSpecificityPlaceholders(rawSource)
      if (outputCss !== rawSource) {
        output.source = outputCss
        options.recordCssAssetResult?.(file, outputCss)
        options.onUpdate(file, rawSource, outputCss)
        options.debug?.('strip mini-program css specificity placeholders: %s bytes=%d', file, outputCss.length)
        updated++
      }
      continue
    }
    if (!shouldFinalizeMiniProgramCssAsset(rawSource)) {
      continue
    }

    const cssHandlerOptions = options.getCssHandlerOptions(file)
    const { css } = await options.styleHandler(rawSource, {
      ...cssHandlerOptions,
      autoprefixer: false,
      cssOptions: {
        ...(cssHandlerOptions.cssOptions ?? {}),
        autoprefixer: false,
        cssPresetEnv: {},
      },
      cssPresetEnv: {},
    })
    const outputCss = stripMiniProgramCssSpecificityPlaceholders(css)
    if (outputCss === rawSource) {
      continue
    }

    output.source = outputCss
    options.recordCssAssetResult?.(file, outputCss)
    options.onUpdate(file, rawSource, outputCss)
    options.debug?.('finalize mini-program css asset: %s bytes=%d', file, outputCss.length)
    updated++
  }
  return updated
}
