import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'

const root = path.resolve('e2e', '.artifacts', 'issue-hbuilderx-windows')
await mkdir(root, { recursive: true })
const channel = process.env.HBUILDERX_CHANNEL
const cases = [
  ['1170-LF', 'e2e/issue-1170-web.test.ts', 'preserves LF styles'],
  ['1170-CRLF', 'e2e/issue-1170-web.test.ts', 'preserves CRLF styles'],
  ['1144-options', `e2e/issue-1144-${channel}.test.ts`, 'keeps options lifecycle'],
  ['1144-setup', `e2e/issue-1144-${channel}.test.ts`, 'keeps setup lifecycle'],
]
const results = []
for (const [name, file, filter] of cases) {
  // Windows CLI 被终止后可能保留 IDE 运行会话；每个场景使用重新启动的专属 IDE。
  await execa(process.execPath, ['scripts/ci/issue-hbuilderx-windows.mjs'], {
    env: { HBUILDERX_RESTART: '1' },
    stdio: 'inherit',
  })
  const result = await execa('pnpm', ['exec', 'vitest', 'run', '-c', 'e2e/vitest.e2e.config.ts', file, '-t', filter, '--update=none'], {
    all: true,
    reject: false,
    timeout: 420_000,
  })
  await writeFile(path.join(root, `${name}.log`), result.all ?? '')
  console.log((result.all ?? '').slice(-6000))
  results.push({ name, exitCode: result.exitCode })
}
await writeFile(path.join(root, 'latest.json'), JSON.stringify(results, null, 2))
if (results.some(result => result.exitCode !== 0)) {
  throw new Error('Windows 最新源码验收存在失败，详见独立场景日志。')
}
