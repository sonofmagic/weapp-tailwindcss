import { createRequire } from 'node:module'
import path from 'node:path'
import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'

const require = createRequire(import.meta.url)

export function resolveWebDemoGeneratorTarget() {
  const target = process.env.WEAPP_TW_TARGET ?? process.env.WEAPP_TAILWINDCSS_TARGET
  return target === 'weapp' ? 'weapp' : 'web'
}

export function createWebDemoWeappTailwindcssWebpackPlugin() {
  return new WeappTailwindcss({
    tailwindcssBasedir: process.cwd(),
    cssSourceTrace: true,
    rem2rpx: false,
    generator: {
      target: resolveWebDemoGeneratorTarget(),
    },
  })
}

export function injectWebDemoWeappTailwindcssCssLoader(config) {
  const runtimeKey = `weapp-tailwindcss-web-demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const loader = path.join(path.dirname(require.resolve('weapp-tailwindcss/webpack')), 'weapp-tw-css-import-rewrite-loader.js')
  const walk = (rule) => {
    if (!rule || typeof rule !== 'object') {
      return
    }
    if (Array.isArray(rule.use)) {
      const cssIndex = rule.use.findIndex(item => typeof item?.loader === 'string' && item.loader.includes('css-loader'))
      const hasWeappLoader = rule.use.some(item => typeof item?.loader === 'string' && item.loader.includes('weapp-tw-css-import-rewrite-loader'))
      if (cssIndex !== -1 && !hasWeappLoader) {
        rule.use.splice(cssIndex + 1, 0, {
          loader,
          options: {
            tailwindcssImportRewriteRuntimeKey: runtimeKey,
          },
        })
      }
    }
    if (Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach(walk)
    }
  }
  for (const rule of config.module?.rules ?? []) {
    walk(rule)
  }
}
