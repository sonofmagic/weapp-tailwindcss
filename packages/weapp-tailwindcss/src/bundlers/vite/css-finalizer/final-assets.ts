import type { OutputBundle } from 'rollup'
import type { CssFinalizerContext } from './options'
import { finalizeMiniProgramCssAssetStructures } from '../generate-bundle/final-css-assets'
import { finalizeWebCssCalc } from './css-calc'

/** 按生成目标统一收尾已组装的 CSS 资产，供空资产和常规分支复用。 */
export function finalizeCssAssets(
  bundle: OutputBundle,
  context: CssFinalizerContext,
  isWebGeneratorTarget: boolean,
  files: ReadonlySet<string>,
) {
  if (isWebGeneratorTarget) {
    return finalizeWebCssCalc(bundle, context)
  }
  finalizeMiniProgramCssAssetStructures(bundle, {
    cssMatcher: context.opts.cssMatcher,
    debug: context.debug,
    files,
    isWebGeneratorTarget,
    onUpdate: context.opts.onUpdate,
    recordCssAssetResult: context.recordCssAssetResult,
  })
}
