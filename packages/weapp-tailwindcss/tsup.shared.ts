type WatchFlag = boolean | string | Array<boolean | string>

export interface WatchAwareOptions {
  watch?: WatchFlag
}

export const runtimeEntries = {
  'index': 'src/index.ts',
  'webpack': 'src/webpack.ts',
  'webpack4': 'src/webpack4.ts',
  'gulp': 'src/gulp.ts',
  'vite': 'src/vite.ts',
  'defaults': 'src/defaults.ts',
  'css-macro': 'src/css-macro/index.ts',
  'css-macro/postcss': 'src/css-macro/postcss.ts',
  'core': 'src/core.ts',
  'presets': 'src/presets.ts',
  'types': 'src/types/index.ts',
  'reset': 'src/reset/index.ts',
  'postcss-html-transform': 'src/postcss-html-transform.ts',
} as const

export const cliEntries = {
  cli: 'src/cli.ts',
} as const

export const escapeEntries = {
  escape: 'src/escape.ts',
} as const

export const webpackLoaderEntries = {
  'weapp-tw-runtime-classset-loader': 'src/bundlers/webpack/loaders/weapp-tw-runtime-classset-loader.ts',
  'weapp-tw-css-import-rewrite-loader': 'src/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader.ts',
} as const

export function createTsupConfigs(options: WatchAwareOptions = {}) {
  const isWatching = Boolean(options.watch)
  const shouldClean = !isWatching

  return [
    {
      entry: runtimeEntries,
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
      // CLI 单独构建，避免未来引入 ESM-only 依赖时污染 runtime 入口共享 chunk。
      entry: cliEntries,
      dts: true,
      clean: false,
      cjsInterop: true,
      splitting: false,
      shims: true,
      format: ['cjs', 'esm'],
      external: ['webpack', 'tailwindcss/plugin'],
      target: ['es2020'],
    },
    {
      entry: escapeEntries,
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
      entry: webpackLoaderEntries,
      dts: true,
      clean: false,
      cjsInterop: true,
      splitting: true,
      shims: true,
      format: ['cjs'],
      external: ['webpack', 'loader-utils'],
    },
  ]
}
