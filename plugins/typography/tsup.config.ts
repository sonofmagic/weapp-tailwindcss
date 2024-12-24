import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.js', 'src/transform.ts'],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  external: ['tailwindcss'],
  target: 'es6',
})
