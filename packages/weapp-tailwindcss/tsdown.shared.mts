type WatchFlag = boolean | string | Array<boolean | string>

export interface WatchAwareOptions {
  watch?: WatchFlag
}

export const runtimeEntries = {
  'index': 'src/index.ts',
  'webpack': 'src/webpack.ts',
  'gulp': 'src/gulp.ts',
  'generator': 'src/generator/index.ts',
  'vite': 'src/vite.ts',
  'postcss': 'src/postcss.ts',
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

function externalizeRuntimeDeps(id: string) {
  return id === 'webpack'
    || id === 'tailwindcss/plugin'
    || id === 'postcss'
    || id === '@vue/compiler-dom'
    || id === '@vue/compiler-sfc'
    || /[\\/]node_modules[\\/]\.pnpm[\\/]postcss@/.test(id)
    || /[\\/]node_modules[\\/]postcss[\\/]/.test(id)
}

function alwaysBundleRuntimeDeps(id: string) {
  return id === 'htmlparser2'
    || id === 'domhandler'
    || id === 'domutils'
    || id === 'domelementtype'
    || id === 'entities'
}

function preserveJsExports({ format }: { format: string }) {
  return {
    js: format === 'es' ? '.mjs' : '.js',
    dts: '.d.ts',
  }
}

export function createTsdownConfigs(options: WatchAwareOptions = {}) {
  const isWatching = Boolean(options.watch)
  const shouldClean = !isWatching

  return [
    {
      entry: runtimeEntries,
      dts: false,
      clean: shouldClean,
      shims: true,
      format: ['cjs', 'esm'],
      deps: {
        alwaysBundle: alwaysBundleRuntimeDeps,
        neverBundle: externalizeRuntimeDeps,
      },
      target: ['es2020'],
      outExtensions: preserveJsExports,
    },
    {
      // CLI 单独构建，避免未来引入 ESM-only 依赖时污染 runtime 入口共享 chunk。
      entry: cliEntries,
      dts: false,
      clean: false,
      shims: true,
      format: ['cjs', 'esm'],
      deps: {
        alwaysBundle: alwaysBundleRuntimeDeps,
        neverBundle: externalizeRuntimeDeps,
      },
      target: ['es2020'],
      outExtensions: preserveJsExports,
    },
    {
      entry: escapeEntries,
      // escape 运行时不能注入 Node 专属 shim，方便浏览器侧 bundler 直接导入。
      dts: false,
      clean: false,
      shims: false,
      format: ['cjs', 'esm'],
      target: ['es2020'],
      outExtensions: preserveJsExports,
    },
    {
      entry: webpackLoaderEntries,
      dts: false,
      clean: false,
      shims: true,
      format: ['cjs'],
      deps: {
        neverBundle: ['webpack'],
      },
      outExtensions: preserveJsExports,
    },
  ]
}
