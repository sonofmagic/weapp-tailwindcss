import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { it } from 'vitest'

const root = fileURLToPath(new URL('../../', import.meta.url))
const eslint = new ESLint({ cwd: root, overrideConfigFile: path.join(root, 'eslint.config.js') })

it.each([
  ['e2e', 'reports', 'local-full-run', 'run-example', 'runner.mjs'],
  ['e2e', 'reports', 'local-full-run', 'run-example', 'coverage', 'prettify.js'],
  ['submodules', 'tailwindcss-mangle', 'packages', 'core', 'src', 'index.ts'],
])('Lint 不扫描生成报告和本地参考源码：%j', async (...segments) => {
  assert.equal(await eslint.isPathIgnored(path.join(root, ...segments)), true)
})

it.each([
  ['scripts', 'agents', 'check.mjs'],
  ['e2e', 'react-native', 'reports.ts'],
  ['packages', 'shared', 'src', 'index.ts'],
])('Lint 继续检查仓库维护的实现：%j', async (...segments) => {
  assert.equal(await eslint.isPathIgnored(path.join(root, ...segments)), false)
})
