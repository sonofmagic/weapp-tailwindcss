import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { weappTailwindcssDisabled } from './platform'
import postcssPlugins from './postcss.config'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // 新版本的 unplugin-auto-import 改成了只有 esm 格式的产物，而 uni-app 目前必须 cjs 格式
  // 所以需要改成动态 import 的写法来进行引入
  // 详见 https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template/issues/29
  const { default: AutoImport } = await import('unplugin-auto-import/vite')
  return {
    // uvtw 一定要放在 uni 后面
    plugins: [
      uni(),
      weappTailwindcss({
        rem2rpx: true,
        disabled: weappTailwindcssDisabled,
      }),
      AutoImport({
        imports: ['vue', 'uni-app', 'pinia'],
        dts: './src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
    ],
    // 内联 postcss 注册 tailwindcss
    css: {
      postcss: {
        plugins: postcssPlugins,
      },
      // https://vitejs.dev/config/shared-options.html#css-preprocessoroptions
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  }
})
