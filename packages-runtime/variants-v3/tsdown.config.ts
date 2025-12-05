import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'node18',
  external: [
    '@weapp-tailwindcss/merge-v3',
    '@weapp-tailwindcss/runtime',
    'tailwind-variant-v3',
  ],
})
