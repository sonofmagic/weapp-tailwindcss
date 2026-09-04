import { defineConfig } from 'tsdown'

interface WatchAwareOptions {
  watch?: boolean | string | Array<boolean | string>
}

export const postcssEsmOnlyDependencies = [
  /^@csstools\//,
  'css-blank-pseudo',
  'css-has-pseudo',
  'css-prefers-color-scheme',
  'postcss-selector-parser',
  'postcss-preset-env',
]

const sharedOptions = {
  entry: ['src/index.ts', 'src/types.ts', 'src/html-transform.ts', 'src/css-macro/postcss.ts'],
  shims: true,
  dts: false,
  outputOptions: {
    minifyInternalExports: false,
  },
  outExtensions({ format }: { format: string }) {
    return {
      js: format === 'es' ? '.js' : '.cjs',
      dts: '.d.ts',
    }
  },
}

export function createPostcssTsdownConfigs(options: WatchAwareOptions = {}) {
  return [
    {
      ...sharedOptions,
      format: ['esm'],
      clean: !options.watch,
      deps: {
        resolveDepSubpath: true,
        neverBundle: postcssEsmOnlyDependencies,
        onlyBundle: false,
      },
    },
    {
      ...sharedOptions,
      format: ['cjs'],
      clean: false,
      deps: {
        resolveDepSubpath: true,
        neverBundle: postcssEsmOnlyDependencies,
        onlyBundle: false,
      },
    },
  ]
}

export default defineConfig((options = {}) => createPostcssTsdownConfigs(options))
