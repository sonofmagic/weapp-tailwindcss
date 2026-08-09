import type { ResolvedConfig } from 'vite'

interface GenericWebProductionFastPathOptions {
  command: ResolvedConfig['command'] | undefined
  frameworkName: string
  hasProcessedCss: boolean
  isWebGeneratorTarget: boolean
  watch: ResolvedConfig['build']['watch'] | undefined
}

export interface GenericWebFinalizerFastPathOptions extends GenericWebProductionFastPathOptions {
  hasFrameworkRootImportShells: boolean
  isHarmonyAppStyleTarget: boolean
  isNativeAppStyleTarget: boolean
}

interface GenericWebProductionBundleHooksOptions {
  frameworkName: string
  getHasProcessedCss: () => boolean
  getIsWebGeneratorTarget: () => boolean
  getResolvedConfig: () => ResolvedConfig | undefined
  onEnd: () => void
  onStart: () => void
}

/**
 * Generic Web 生产构建的 CSS 已在 Vite transform 阶段生成时，不需要再建立面向小程序的完整产物快照。
 */
export function shouldUseGenericWebProductionFastPath(
  options: GenericWebProductionFastPathOptions,
) {
  return options.frameworkName === 'generic'
    && options.command === 'build'
    && options.watch == null
    && options.isWebGeneratorTarget
    && options.hasProcessedCss
}

/**
 * Finalizer fast path 只处理无小程序结构语义的 Generic Web 生产产物。
 */
export function shouldUseGenericWebFinalizerFastPath(
  options: GenericWebFinalizerFastPathOptions,
) {
  return shouldUseGenericWebProductionFastPath(options)
    && !options.hasFrameworkRootImportShells
    && !options.isHarmonyAppStyleTarget
    && !options.isNativeAppStyleTarget
}

/**
 * 将 Generic Web fast path 的判定和跳过生命周期集中起来，供 generateBundle hook 直接消费。
 */
export function createGenericWebProductionBundleHooks(
  options: GenericWebProductionBundleHooksOptions,
) {
  return {
    onSkipProcessBundle: () => {
      options.onStart()
      options.onEnd()
    },
    shouldProcessBundle: () => {
      const config = options.getResolvedConfig()
      return !shouldUseGenericWebProductionFastPath({
        command: config?.command,
        frameworkName: options.frameworkName,
        hasProcessedCss: options.getHasProcessedCss(),
        isWebGeneratorTarget: options.getIsWebGeneratorTarget(),
        watch: config?.build?.watch,
      })
    },
  }
}
