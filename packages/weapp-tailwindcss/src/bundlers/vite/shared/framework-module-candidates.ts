import type { ValidateCandidatesByGeneratorOptions } from '@/bundlers/shared/generator-css'
import type { SourceCandidateStore } from '@/bundlers/shared/source-candidates/types-and-cache'
import { validateCandidatesByGenerator } from '@/bundlers/shared/generator-css'
import { cleanUrl } from '../utils'

interface FrameworkModuleCandidateRegistrarOptions {
  cacheCurrent: () => void
  debug: ValidateCandidatesByGeneratorOptions['debug']
  getCssHandlerOptions: (id: string) => ValidateCandidatesByGeneratorOptions['cssHandlerOptions']
  getGeneratorPlatform: () => ValidateCandidatesByGeneratorOptions['generatorPlatform']
  invalidateRecordedGeneratorCandidates: () => void
  opts: ValidateCandidatesByGeneratorOptions['opts']
  runtimeState: ValidateCandidatesByGeneratorOptions['runtimeState']
  sourceCandidateCollector: Pick<SourceCandidateStore, 'syncModuleSource'>
  styleHandler: ValidateCandidatesByGeneratorOptions['styleHandler']
}

export function createFrameworkModuleCandidateRegistrar(options: FrameworkModuleCandidateRegistrarOptions) {
  return async (id: string, source: string) => {
    await options.runtimeState.readyPromise
    const candidates = await options.sourceCandidateCollector.syncModuleSource(id, source)
    options.invalidateRecordedGeneratorCandidates()
    options.cacheCurrent()
    const cssHandlerOptions = options.getCssHandlerOptions(id)
    return validateCandidatesByGenerator({
      candidates,
      cssHandlerOptions,
      cssUserHandlerOptions: cssHandlerOptions,
      debug: options.debug,
      file: cleanUrl(id),
      generatorPlatform: options.getGeneratorPlatform(),
      opts: options.opts,
      rawSource: '',
      runtimeState: options.runtimeState,
      styleHandler: options.styleHandler,
    })
  }
}
