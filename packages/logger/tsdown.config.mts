import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  deps: {
    alwaysBundle: ['consola', 'picocolors'],
  },
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
      dts: '.d.ts',
    }
  },
})
