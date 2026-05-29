import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  shims: true,
  deps: {
    alwaysBundle: ['defu', 'fs-extra', 'pathe'],
    neverBundle: ['vite'],
  },
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.cjs',
      dts: '.d.ts',
    }
  },
})
