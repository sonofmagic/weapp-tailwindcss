import { createRequire } from 'node:module'
import { assert, test } from 'vitest'

const require = createRequire(import.meta.url)

test('CommonJS 自引用入口指向构建产物', () => {
  const resolved = require.resolve('@weapp-tailwindcss/postcss-calc')
  const mod = require('@weapp-tailwindcss/postcss-calc')

  assert.match(resolved, /dist\/index\.cjs$/)
  assert.strictEqual(typeof mod, 'function')
  assert.strictEqual(mod.postcss, true)
})
