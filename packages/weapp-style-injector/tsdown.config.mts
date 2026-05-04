import { defineConfig } from 'tsdown'

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
  dts: false,
  deps: {
    neverBundle: ['vite'],
  },
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.cjs',
      dts: '.d.ts',
    }
  },
})
