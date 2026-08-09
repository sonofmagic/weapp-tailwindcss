import type { ResolvedConfig } from 'vite'

interface GenericWebProductionFastPathOptions {
  command: ResolvedConfig['command'] | undefined
  frameworkName: string
  hasProcessedCss: boolean
  isWebGeneratorTarget: boolean
  watch: ResolvedConfig['build']['watch'] | undefined
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
