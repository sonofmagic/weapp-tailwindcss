import { createRequire } from 'node:module'

const require = createRequire(__filename)
// Use require so TS doesn't resolve tsup's broken './types.cts' import during type-checking
const { defineConfig } = require('tsup') as { defineConfig: (...args: any[]) => any }

type WatchFlag = boolean | string | Array<boolean | string>
interface WatchAwareOptions {
  watch?: WatchFlag
}

export default defineConfig((options: WatchAwareOptions = {}) => {
  // Avoid cleaning during watch rebuilds or tsup deletes loader outputs mid-dev
  const isWatching = Boolean(options.watch)
  const shouldClean = !isWatching

  return [
    {
      entry: {
        'index': 'src/index.ts',
        'webpack': 'src/webpack.ts',
        'webpack4': 'src/webpack4.ts',
        'gulp': 'src/gulp.ts',
        'cli': 'src/cli.ts',
        'vite': 'src/vite.ts',
        'defaults': 'src/defaults.ts',
        'css-macro': 'src/css-macro/index.ts',
        'css-macro/postcss': 'src/css-macro/postcss.ts',
        'core': 'src/core.ts',
        'presets': 'src/presets.ts',
        'types': 'src/types/index.ts',
        'reset': 'src/reset/index.ts',
        'postcss-html-transform': 'src/postcss-html-transform.ts',
      },
      dts: true,
      clean: shouldClean,
      cjsInterop: true,
      splitting: true,
      shims: true,
      format: ['cjs', 'esm'],
      external: ['webpack', 'tailwindcss/plugin'],
      target: ['es2020'],

    },
    {
      entry: {
        escape: 'src/escape.ts',
      },
      // Keep the escape runtime free of Node-only shims so bundlers can import it in-browser.
      dts: true,
      clean: false,
      cjsInterop: true,
      splitting: false,
      shims: false,
      format: ['cjs', 'esm'],
      target: ['es2020'],
    },
    {
      entry: {
        'weapp-tw-runtime-classset-loader': 'src/bundlers/webpack/loaders/weapp-tw-runtime-classset-loader.ts',
        'weapp-tw-css-import-rewrite-loader': 'src/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader.ts',
      },
      dts: true,
      clean: false,
      cjsInterop: true,
      splitting: true,
      shims: true,
      format: ['cjs'],
      external: ['webpack', 'loader-utils'],
    },
  ]
})
