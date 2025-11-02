import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      'src/cva.ts',
      'src/v3.ts',
      'src/v4.ts',
      'src/postinstall.ts',
    ],
    shims: true,
    format: ['cjs', 'esm'],
    clean: true,
    dts: true,
    // https://github.com/egoist/tsup/pull/1056
    // https://github.com/egoist/tsup/issues?q=cjsInterop
    cjsInterop: true,
    splitting: true,
  },
])
