import type { UserDefinedOptions } from '@/types'

/** Vite 插件链按运行场景拆分的能力开关。 */
export interface ViteCapabilityProfile {
  name: 'framework' | 'generic-web'
  sourceCandidates: boolean
  frameworkExtras: boolean
  serveJsTransform: boolean
  styleInjector: boolean
}

export const frameworkViteCapabilityProfile: ViteCapabilityProfile = {
  name: 'framework',
  sourceCandidates: true,
  frameworkExtras: true,
  serveJsTransform: true,
  styleInjector: true,
}

export function createGenericWebViteCapabilityProfile(options: UserDefinedOptions): ViteCapabilityProfile {
  return {
    name: 'generic-web',
    // tracing 需要源码候选图；显式打开时恢复该能力。
    sourceCandidates: options.cssSourceTrace === true || typeof options.cssSourceTrace === 'object',
    frameworkExtras: false,
    serveJsTransform: false,
    // 高级用户显式配置 styleInjector 时仍允许注入。
    styleInjector: options.styleInjector !== undefined,
  }
}
