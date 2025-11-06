import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    extractors: 'src/extractors/index.ts',
    node: 'src/node.ts',
  },
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  // https://github.com/egoist/tsup/pull/1056
  // https://github.com/egoist/tsup/issues?q=cjsInterop
  cjsInterop: true,
  splitting: true,
})
