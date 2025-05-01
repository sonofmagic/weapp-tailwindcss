import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  plugins: [
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true,
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
