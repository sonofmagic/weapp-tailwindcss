import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { expect, it } from 'vitest'
import { runCommand } from '../src/process'

it('原生可执行文件不存在时返回带命令和 cwd 的分类错误', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hbuilderx-missing-'))
  const command = path.join(root, 'missing-cli.exe')
  try {
    await expect(runCommand({ command, args: [], cwd: root, timeoutMs: 5000 })).rejects.toMatchObject({
      name: 'HBuilderXCommandError',
      result: { command, cwd: root, issue: { kind: 'cli-not-found' } },
    })
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})

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

it.skipIf(process.platform !== 'win32')('通过 PATH 运行带空格目录中的 cmd shim，并保留参数', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hbuilderx shim & 中文-'))
  try {
    const file = path.join(root, 'arguments.cjs')
    await writeFile(file, 'process.stdout.write(JSON.stringify(process.argv.slice(2)))')
    await writeFile(path.join(root, 'hx-test.cmd'), '@echo off\r\n"%HX_TEST_NODE%" "%~dp0arguments.cjs" %*\r\n')
    const args = ['中文 空格', 'C:\\目录\\', 'a&b', '(value)', '', 'a|b', '%PATH%']
    const result = await runCommand({
      command: 'hx-test',
      args,
      cwd: root,
      env: { PATH: root, HX_TEST_NODE: process.execPath },
      timeoutMs: 5000,
    })
    expect(JSON.parse(result.output)).toEqual(args)
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
