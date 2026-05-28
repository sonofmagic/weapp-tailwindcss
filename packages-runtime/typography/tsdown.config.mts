import { copyFile } from 'node:fs/promises'
import { defineConfig } from 'tsdown'

const sharedOptions = {
  // 禁用 Node.js shim，保持 ESM 产物适合浏览器侧 bundler 直接使用。
  shims: false,
  format: ['cjs', 'esm'],
  deps: {
    alwaysBundle: [
      'htmlparser2',
      'lodash.castarray',
      'lodash.isplainobject',
      'lodash.merge',
      'magic-string',
      'postcss-selector-parser',
    ],
    neverBundle: [/^tailwindcss(\/|$)/],
  },
  target: 'es6',
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
      dts: '.d.ts',
    }
  },
} satisfies Parameters<typeof defineConfig>[0]

export default defineConfig([
  {
    ...sharedOptions,
    entry: ['src/index.js'],
    clean: true,
    dts: false,
    hooks: {
      'build:done': async () => {
        await copyFile('src/index.d.ts', 'dist/index.d.ts')
      },
    },
  },
  {
    ...sharedOptions,
    entry: ['src/transform.ts'],
    clean: false,
    dts: true,
  },
])
