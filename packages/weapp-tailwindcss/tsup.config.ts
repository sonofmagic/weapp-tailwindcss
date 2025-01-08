import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'webpack': 'src/webpack.ts',
    'webpack4': 'src/webpack4.ts',
    'gulp': 'src/gulp.ts',
    'postcss': 'src/postcss.ts',
    'cli': 'src/cli.ts',
    'replace': 'src/replace.ts',
    'vite': 'src/vite.ts',
    'weapp-tw-runtime-loader': 'src/bundlers/webpack/loaders/weapp-tw-runtime-loader.ts',
    'defaults': 'src/defaults.ts',
    'css-macro': 'src/css-macro/index.ts',
    'css-macro/postcss': 'src/css-macro/postcss.ts',
    'core': 'src/core.ts',
    'escape': 'src/escape.ts',
  },
  dts: true,
  clean: true,
  cjsInterop: true,
  splitting: true,
  format: ['cjs', 'esm'],
  external: ['webpack', 'loader-utils', 'tailwindcss/plugin', '@ast-grep/napi', '@weapp-tailwindcss/cli'],
})
