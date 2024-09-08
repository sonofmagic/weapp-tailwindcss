import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'
import { WeappTailwindcssDisabled } from './platform'
import postcssPlugins from './postcss.config.cjs'

// https://vitejs.dev/config/
export default defineConfig({
  // uvtw 一定要放在 uni 后面
  plugins: [
    uni(),
    uvtw({
      rem2rpx: true,
      disabled: WeappTailwindcssDisabled,
      // 使用新的 ast-grep 来处理 js 资源，速度是 babel 的2倍左右
      // 需要先安装 `@ast-grep/napi`, 安装完成后再启用下方配置
      // jsAstTool: 'ast-grep'
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
      // @ts-ignore
      plugins: postcssPlugins,
    },
  },
})
