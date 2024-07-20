import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {

  },
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
})
