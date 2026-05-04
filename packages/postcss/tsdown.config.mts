import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/types.ts', 'src/html-transform.ts'],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: false,
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
      dts: '.d.ts',
    }
  },
})
