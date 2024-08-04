import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
})
