import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.js', 'src/transform.ts'],
  // 禁用 Node.js shim，保持 ESM 产物适合浏览器侧 bundler 直接使用。
  shims: false,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  deps: {
    neverBundle: ['tailwindcss'],
  },
  target: 'es6',
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
      dts: '.d.ts',
    }
  },
})
