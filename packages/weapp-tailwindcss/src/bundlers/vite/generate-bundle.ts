import type { OutputAsset, OutputChunk } from 'rollup'
import type { GenerateBundleContext, GenerateBundleThis } from './generate-bundle/types'
import { beginCompilerShadowRun } from '@/compiler'
import { createGenerateBundleHook as createRuntimeGenerateBundleHook } from './generate-bundle-runtime'

// cssPipelineStrategy 的阶段调度由内部 runtime 实现承担。

export { normalizeBundleFileNameKeysForTest } from './generate-bundle/bundle-file-names'
export { resolveMiniProgramStyleOutputExtension, resolveReplayCssOutputFile, resolveReplayCssOutputFileFromSourceRoot, resolveViteCssPipelineOutputFile, resolveViteCssPipelineOutputFileFromSourceFile } from './generate-bundle/css-output'
export { resolveRememberedCssSourceForTest } from './generate-bundle/remembered-css'
export { shouldKeepRootMiniProgramStyleAsImportShell, shouldMoveRootMiniProgramStyleToImportShellOrigin } from './generate-bundle/root-style-output'
export type { GenerateBundleContext, GenerateBundleThis, RememberedCssSource } from './generate-bundle/types'

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const runtimeHandler = createRuntimeGenerateBundleHook(context) as (
    this: GenerateBundleThis,
    options: unknown,
    bundle: Record<string, OutputAsset | OutputChunk>,
  ) => Promise<void>
  return async function generateBundle(
    this: GenerateBundleThis,
    options: unknown,
    bundle: Record<string, OutputAsset | OutputChunk>,
  ) {
    beginCompilerShadowRun(context.runtimeState)
    await runtimeHandler.call(this, options, bundle)
  }
}
