import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/tailwindcss.ts'], // , 'src/cli.ts'],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  external: ['tailwindcss'],
  // https://github.com/egoist/tsup/pull/1056
  // https://github.com/egoist/tsup/issues?q=cjsInterop
  // cjsInterop: true,
  // splitting: true,
})
