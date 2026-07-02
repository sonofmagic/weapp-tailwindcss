import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rsbuild/core'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { patchRspackConfig } from 'weapp-tailwindcss/rspack'
import { createWebDemoWeappTailwindcssWebpackPlugin } from '../shared/webpack-plugin-target.mjs'

const projectRoot = dirname(fileURLToPath(import.meta.url))

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
      config.plugins.push(createWebDemoWeappTailwindcssWebpackPlugin(projectRoot))
      config.optimization ??= {}
      config.optimization.minimize = false
      return config
    },
  },
})
