import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/taro.ts',
    'src/uni-app.ts',
    'src/vite.ts',
    'src/vite/uni-app.ts',
    'src/vite/taro.ts',
    'src/webpack.ts',
    'src/webpack/uni-app.ts',
    'src/webpack/taro.ts',
  ],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  external: ['vite'],
  // https://github.com/egoist/tsup/pull/1056
  // https://github.com/egoist/tsup/issues?q=cjsInterop
  cjsInterop: true,
  splitting: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'mjs' : 'cjs'}`,
    }
  },
})
