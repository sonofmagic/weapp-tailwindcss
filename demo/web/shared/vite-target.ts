import type { PluginOption } from 'vite'
import process from 'node:process'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export type WebDemoGeneratorTarget = 'web' | 'weapp'

export function resolveWebDemoGeneratorTarget(): WebDemoGeneratorTarget {
  const target = process.env.WEAPP_TW_TARGET ?? process.env.WEAPP_TAILWINDCSS_TARGET
  return target === 'weapp' ? 'weapp' : 'web'
}

export function createWebDemoWeappTailwindcssPlugins(): PluginOption[] {
  const target = resolveWebDemoGeneratorTarget()
  return WeappTailwindcss({
    tailwindcssBasedir: process.cwd(),
    cssSourceTrace: true,
    rem2rpx: false,
    generator: {
      target,
    },
  }) ?? []
}
