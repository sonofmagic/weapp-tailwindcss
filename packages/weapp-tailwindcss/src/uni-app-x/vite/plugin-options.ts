import type { HmrContext, ResolvedConfig } from 'vite'
import type {
  AppType,
  ICustomAttributesEntities,
  InternalUserDefinedOptions,
  JsHandler,
} from '@/types'

export interface CreateUniAppXPluginsOptions {
  appType: AppType
  customAttributesEntities: ICustomAttributesEntities
  disabledDefaultTemplateHandler: boolean | undefined
  mainCssChunkMatcher: NonNullable<InternalUserDefinedOptions['mainCssChunkMatcher']>
  runtimeState: { readyPromise: Promise<unknown> }
  styleHandler: InternalUserDefinedOptions['styleHandler']
  syncSourceCandidatesForHotUpdate?: ((ctx: HmrContext) => Promise<void>) | undefined
  tailwindRootCssModuleIds?: Iterable<string> | undefined
  generateCss?: ((id: string, code: string, hookContext?: {
    addWatchFile?: (id: string) => void
    disableSourceScan?: boolean
    sourceCandidates?: Iterable<string>
    transient?: boolean
  }) => Promise<string | undefined> | string | undefined) | undefined
  jsHandler: JsHandler
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  getResolvedConfig: () => ResolvedConfig | undefined
  isIosPlatform?: boolean
  isNativeAppStyleTarget?: (() => boolean) | undefined
  isWebGeneratorTarget?: (() => boolean) | undefined
  isEnabled?: (() => boolean) | undefined
  uniAppX?: InternalUserDefinedOptions['uniAppX']
  viteProcessedCssSourceFiles?: Iterable<string> | undefined
}
