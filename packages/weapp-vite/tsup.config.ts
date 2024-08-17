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
  shims: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'mjs' : 'cjs'}`,
    }
  },
  // external: ['vite'],
})
