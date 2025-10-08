import { defineConfig } from 'vite'

/**
 * Vite 会在生产模式下调用 esbuild 压缩，这里开启 keepNames 以保留 weappTwIgnore/twMerge 等函数名。
 */
export default defineConfig({
  build: {
    minify: 'esbuild',
    esbuild: {
      keepNames: true,
      // 如需彻底禁用属性混淆，可以显式关闭 mangle
      mangleProps: false,
    },
  },
})
