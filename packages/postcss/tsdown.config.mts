import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/types.ts', 'src/html-transform.ts', 'src/css-macro/postcss.ts'],
  shims: true,
  format: ['cjs', 'esm'],
  deps: {
    alwaysBundle: [
      /^@csstools\//,
      'css-blank-pseudo',
      'css-has-pseudo',
      'css-prefers-color-scheme',
      'postcss-selector-parser',
      'postcss-preset-env',
    ],
  },
  clean: true,
  dts: false,
  outputOptions: {
    minifyInternalExports: false,
  },
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
      dts: '.d.ts',
    }
  },
})
