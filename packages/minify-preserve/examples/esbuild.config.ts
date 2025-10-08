import { build } from 'esbuild'

/**
 * 独立使用 esbuild 时，keepNames 也需要开启，否则函数名会被压缩。
 */
await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  keepNames: true,
})
