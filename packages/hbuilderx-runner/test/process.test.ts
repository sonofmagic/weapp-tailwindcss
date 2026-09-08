import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { expect, it } from 'vitest'
import { runCommand } from '../src/process'

it('保留原生进程的参数边界，包括空格、中文、反斜杠与 shell 字符', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hbuilderx 参数 & 边界-'))
  const file = path.join(root, '读取 参数.cjs')
  const args = ['中文 空格', 'C:\\项目目录\\', 'a&b', '(value)', 'quote"value', '', 'a|b', '%PATH%']
  try {
    await writeFile(file, 'process.stdout.write(JSON.stringify(process.argv.slice(2)))')
    const result = await runCommand({
      command: process.execPath,
      args: [file, ...args],
      cwd: root,
      timeoutMs: 5000,
    })
    expect(JSON.parse(result.output)).toEqual(args)
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
