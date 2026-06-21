import type { OutputAsset, OutputChunk } from 'rollup'
import type { GenerateBundleContext } from './types'

function readAssetSource(output: OutputAsset) {
  return typeof output.source === 'string'
    ? output.source
    : output.source.toString()
}

function shouldFinalizeMiniProgramCssAsset(source: string) {
  return source.includes(':hover') || source.includes('does-not-exist')
}

export async function finalizeMiniProgramCssAssets(
  bundle: Record<string, OutputAsset | OutputChunk>,
  options: {
    cssMatcher: GenerateBundleContext['opts']['cssMatcher']
    getCssHandlerOptions: GenerateBundleContext['getCssHandlerOptions']
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
    if (options.lastCssResultByFile?.has(file)) {
      continue
    }

    const rawSource = readAssetSource(output)
    if (rawSource.trim().length === 0) {
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
        cssPresetEnv: false,
      },
      cssPresetEnv: false,
    })
    if (css === rawSource) {
      continue
    }

    output.source = css
    options.recordCssAssetResult?.(file, css)
    options.onUpdate(file, rawSource, css)
    options.debug?.('finalize mini-program css asset: %s bytes=%d', file, css.length)
    updated++
  }
  return updated
}
