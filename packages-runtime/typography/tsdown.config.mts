import { copyFile } from 'node:fs/promises'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.js', 'src/transform.ts'],
  // 禁用 Node.js shim，保持 ESM 产物适合浏览器侧 bundler 直接使用。
  shims: false,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
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
  hooks: {
    'build:done': async () => {
      await copyFile('src/index.d.ts', 'dist/index.d.ts')
    },
  },
  target: 'es6',
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
      dts: '.d.ts',
    }
  },
})
