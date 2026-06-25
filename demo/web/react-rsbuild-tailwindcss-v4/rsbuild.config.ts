import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rsbuild/core'
import { createWebDemoWeappTailwindcssWebpackPlugin, injectWebDemoWeappTailwindcssCssLoader } from '../shared/webpack-plugin-target.mjs'

function removeLightningCssLoaders(rule: any) {
  if (!rule || typeof rule !== 'object') {
    return
  }
  if (Array.isArray(rule.use)) {
    rule.use = rule.use.filter((item: any) => item?.loader !== 'builtin:lightningcss-loader')
  }
  if (Array.isArray(rule.oneOf)) {
    rule.oneOf.forEach(removeLightningCssLoaders)
  }
}

export default defineConfig({
  plugins: [
    pluginReact(),
  ],
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  output: {
    distPath: {
      root: process.env.RSDIST ?? 'dist',
    },
  },
  html: {
    template: './index.html',
  },
  tools: {
    rspack(config) {
      for (const rule of config.module?.rules ?? []) {
        removeLightningCssLoaders(rule)
      }
      injectWebDemoWeappTailwindcssCssLoader(config)
      config.plugins ??= []
      config.plugins.push(createWebDemoWeappTailwindcssWebpackPlugin())
      config.optimization ??= {}
      config.optimization.minimize = false
      return config
    },
  },
})
