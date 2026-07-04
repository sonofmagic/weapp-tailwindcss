import type { OutputBundle } from 'rollup'
import type { ResolvedConfig } from 'vite'
import type { getCompilerContext } from '@/context'
import type { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import type { resolveGeneratorRuntimeBranch } from '@/runtime-branch'
import type { CreateJsHandlerOptions, InternalUserDefinedOptions } from '@/types'

export interface ViteFrameworkExtraPluginPlatform {
  isIosPlatform?: boolean | undefined
}

export interface ViteFrameworkRuntimeFeatureContext {
  uniAppX: ReturnType<typeof getCompilerContext>['uniAppX']
}

export interface ViteFrameworkCssPipelineContext {
  bundle?: OutputBundle | undefined
  currentGeneratorBranch: ReturnType<typeof resolveGeneratorRuntimeBranch>
  currentGeneratorOptions: ReturnType<typeof normalizeWeappTailwindcssGeneratorOptions>
  opts: InternalUserDefinedOptions
  resolvedConfig: ResolvedConfig | undefined
  resolveStylePlatform: () => string | undefined
}

export interface ViteFrameworkCssPipelineStrategy {
  getCssHandlerExtraOptions?: (context: ViteFrameworkCssPipelineContext & { file: string }) => Record<string, unknown>
  getServeJsHandlerOptions?: (context: ViteFrameworkCssPipelineContext & { file: string }) => CreateJsHandlerOptions | undefined
  isHarmonyAppStyleTarget?: (context: ViteFrameworkCssPipelineContext) => boolean
  isNativeAppStyleTarget?: (context: ViteFrameworkCssPipelineContext) => boolean
  shouldApplyWebCssCompat?: (context: ViteFrameworkCssPipelineContext) => boolean
  shouldDeferEmptyScopedCssSource?: (context: ViteFrameworkCssPipelineContext & {
    cssHandlerOptions: { isMainChunk?: boolean | undefined }
    generatorCode: string
  }) => boolean
  shouldPreserveStyleOutputExtension?: (context: ViteFrameworkCssPipelineContext) => boolean
  shouldTransformServeJs?: (context: ViteFrameworkCssPipelineContext) => boolean
  transformGeneratedCss?: (css: string, context: ViteFrameworkCssPipelineContext & {
    defaultWebCssCompat: (css: string) => string
    removeScopedPreflight: (css: string) => string
    shouldApplyWebCssCompat: boolean
  }) => string
}
