import type { PluginOption } from 'vite'
import { resolve } from 'node:path'
import process from 'node:process'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export type WebDemoGeneratorTarget = 'web' | 'weapp'

export function resolveWebDemoGeneratorTarget(): WebDemoGeneratorTarget {
  const target = process.env.WEAPP_TW_TARGET ?? process.env.WEAPP_TAILWINDCSS_TARGET
  return target === 'weapp' ? 'weapp' : 'web'
}

export function createWebDemoWeappTailwindcssPlugins(projectRoot: string): PluginOption[] {
  const target = resolveWebDemoGeneratorTarget()
  return WeappTailwindcss({
    tailwindcssBasedir: projectRoot,
    cssEntries: [
      resolve(projectRoot, 'src/style.css'),
    ],
    cssSourceTrace: true,
    rem2rpx: false,
    generator: {
      target,
      webCompat: target === 'web'
        ? {
            preset: 'legacy-web',
          }
        : undefined,
    },
  }) ?? []
}
