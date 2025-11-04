import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.js', 'src/transform.ts'],
  // Disable Node.js shims so the ESM build stays browser-friendly
  shims: false,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  external: ['tailwindcss'],
  target: 'es6',
})
