import path from 'node:path'
import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'

export function resolveWebDemoGeneratorTarget() {
  const target = process.env.WEAPP_TW_TARGET ?? process.env.WEAPP_TAILWINDCSS_TARGET
  return target === 'weapp' ? 'weapp' : 'web'
}

export function createWebDemoWeappTailwindcssWebpackPlugin() {
  return new WeappTailwindcss({
    tailwindcssBasedir: process.cwd(),
    cssEntries: [path.resolve(process.cwd(), 'src/style.css')],
    cssSourceTrace: true,
    rem2rpx: false,
    generator: {
      target: resolveWebDemoGeneratorTarget(),
    },
  })
}
