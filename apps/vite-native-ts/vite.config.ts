import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'
import { resolveAppGeneratorMode } from '../shared/weapp-tailwind-generator-mode'

const generator = resolveAppGeneratorMode()

export default defineConfig({
  plugins: [
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true,
      ...(generator !== undefined ? { generator } : {}),
    }),
  ],
  weapp: {
    enhance: {
      autoImportComponents: {
        globs: ['components/**/*'],
      },
    },
    // weapp-vite options
    srcRoot: './miniprogram',
    generate: {
      extensions: {
        js: 'ts',
        wxss: 'scss',
        json: 'ts',
      },
      dirs: {
        component: 'miniprogram/components',
        page: 'miniprogram/pages',
      },
      filenames: {
        component: 'index',
        page: 'index',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
})
