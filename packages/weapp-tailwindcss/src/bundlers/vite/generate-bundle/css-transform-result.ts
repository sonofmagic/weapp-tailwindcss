import type { ViteCssTransformTaskResult } from './css-transform-task'
import { registerGeneratorDependencies } from './rollup-assets'
import { summarizeStringDiff } from './signatures'

export interface ApplyViteCssTransformTaskResultOptions {
  addWatchFile?: ((id: string) => void) | undefined
  debug: (format: string, ...args: unknown[]) => void
  debugCssDiff: boolean
  file: string
  generatorSourceFile: string
  outputFile: string
  outputIsMainChunk: boolean
  recordCssAssetResult?: ((file: string, css: string) => void) | undefined
  recordViteProcessedCssAssetResult?: ((
    file: string,
    css: string,
    options?: {
      injectIntoMain?: boolean | undefined
      outputFile?: string | undefined
    },
  ) => void) | undefined
  result: ViteCssTransformTaskResult
  shouldInjectVitePipelineCssIntoMain: boolean
  shouldRecordVitePipelineCssByOutput: boolean
  tailwindcssMajorVersion?: number | undefined
  transformRuntime: Set<string>
  vitePipelineCssAsset: boolean
  vitePipelineCssInjectionOutputFile: string
}

export function applyViteCssTransformTaskResult(
  options: ApplyViteCssTransformTaskResultOptions,
) {
  const { result } = options
  registerGeneratorDependencies(
    { addWatchFile: options.addWatchFile },
    result.dependencies,
  )
  if (options.debugCssDiff && result.diffSource != null) {
    options.debug(
      'css diff %s: %s',
      options.generatorSourceFile,
      summarizeStringDiff(result.diffSource, result.css),
    )
  }
  if (result.shouldRecordCssAsset) {
    options.recordCssAssetResult?.(options.outputFile, result.css)
  }

  if (result.kind === 'tailwind') {
    options.debug('css generated result: %s bytes=%d', options.file, result.css.length)
    for (const candidate of result.classSet ?? []) {
      options.transformRuntime.add(candidate)
    }
    if (options.shouldRecordVitePipelineCssByOutput) {
      options.recordViteProcessedCssAssetResult?.(
        options.vitePipelineCssInjectionOutputFile,
        result.css,
        {
          injectIntoMain: options.outputIsMainChunk
            ? false
            : options.shouldInjectVitePipelineCssIntoMain,
          outputFile: options.vitePipelineCssInjectionOutputFile,
        },
      )
    }
    if (options.vitePipelineCssAsset && options.shouldInjectVitePipelineCssIntoMain) {
      options.recordViteProcessedCssAssetResult?.(options.file, result.css, {
        injectIntoMain: true,
        outputFile: options.vitePipelineCssInjectionOutputFile,
      })
    }
    options.debug(
      'css handle via tailwind v%s engine(%s): %s',
      options.tailwindcssMajorVersion,
      result.generatorTarget,
      options.outputFile,
    )
  }
  else if (result.kind === 'web') {
    options.debug('css preserve web target: %s', options.outputFile)
  }
  else if (result.kind === 'import-shell') {
    options.debug('css preserve mini-program import shell: %s', options.outputFile)
  }

  return result.css
}
