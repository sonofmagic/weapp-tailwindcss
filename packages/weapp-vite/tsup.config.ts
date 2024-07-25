import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/index.ts',
  },
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  external: ['vite'],
})
