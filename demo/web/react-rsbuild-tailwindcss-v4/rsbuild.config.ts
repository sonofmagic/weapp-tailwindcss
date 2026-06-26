import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rsbuild/core'
import { patchRspackConfig } from 'weapp-tailwindcss/rspack'
import { createWebDemoWeappTailwindcssWebpackPlugin } from '../shared/webpack-plugin-target.mjs'

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
      patchRspackConfig(config)
      config.plugins ??= []
      config.plugins.push(createWebDemoWeappTailwindcssWebpackPlugin())
      config.optimization ??= {}
      config.optimization.minimize = false
      return config
    },
  },
})
