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
const selected = cases.filter(([name]) => !process.env.E2E_WINDOWS_CASE || process.env.E2E_WINDOWS_CASE === 'all' || process.env.E2E_WINDOWS_CASE === name)
if (selected.length === 0) {
  throw new Error(`未知 Windows 验收场景：${process.env.E2E_WINDOWS_CASE}`)
}
for (const [name, file, filter] of selected) {
  // 每个场景使用独立 Vitest 进程，因此项目别名也独立；保留 IDE 自身的正常生命周期。
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
