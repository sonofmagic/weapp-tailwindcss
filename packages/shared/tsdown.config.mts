import { defineConfig } from 'tsdown'

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
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
      dts: '.d.ts',
    }
  },
})
