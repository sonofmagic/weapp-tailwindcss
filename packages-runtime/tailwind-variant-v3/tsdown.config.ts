import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/index.js',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'node18',
  external: [
    'tailwindcss/resolveConfig',
  ],
})
