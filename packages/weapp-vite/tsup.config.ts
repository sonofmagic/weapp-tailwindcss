import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    config: 'src/config.ts',
  },
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  // external: ['vite'],
})
