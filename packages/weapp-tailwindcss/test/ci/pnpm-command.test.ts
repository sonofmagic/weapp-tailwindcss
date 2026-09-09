import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { createPnpmCommand } from '../../../../scripts/pnpm-command.mjs'

describe('pnpm command', () => {
  for (const platform of ['win32', 'darwin', 'linux']) {
    const paths = platform === 'win32' ? path.win32 : path.posix
    const root = platform === 'win32' ? 'C:\\工具 & space' : '/工具 & space'
    const execPath = paths.join(root, platform === 'win32' ? 'node.exe' : 'node')

    it.each(['pnpm.cjs', 'pnpm.mjs', 'pnpm.js'])(`runs JavaScript entry %s through Node on ${platform}`, (entry) => {
      const npmExecPath = paths.join(root, entry)
      expect(createPnpmCommand(['build', '参数 & space'], { platform, execPath, npmExecPath })).toEqual({
        command: execPath,
        args: [npmExecPath, 'build', '参数 & space'],
        shell: false,
      })
    })

    it(`runs the native pnpm entry directly on ${platform}`, () => {
      const npmExecPath = paths.join(root, platform === 'win32' ? 'pnpm.exe' : 'pnpm')
      expect(createPnpmCommand(['build'], { platform, execPath, npmExecPath })).toEqual({
        command: npmExecPath,
        args: ['build'],
        shell: false,
      })
    })

    it(`uses the platform fallback when no active entry exists on ${platform}`, () => {
      expect(createPnpmCommand(['build'], { platform, execPath, npmExecPath: undefined })).toEqual({
        command: platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
        args: ['build'],
        shell: platform === 'win32',
      })
    })
  }

  it('uses a shell for an explicit Windows command shim', () => {
    expect(createPnpmCommand(['build'], { platform: 'win32', npmExecPath: 'C:\\pnpm\\pnpm.cmd' })).toEqual({
      command: 'C:\\pnpm\\pnpm.cmd',
      args: ['build'],
      shell: true,
    })
  })

  it('executes a real native binary and preserves arguments and exit codes', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'pnpm 原生 & space-'))
    try {
      // Node 本身是原生程序，用同一入口验证二进制不会被当作 JavaScript 读取。
      const npmExecPath = path.join(root, process.platform === 'win32' ? 'pnpm.exe' : 'pnpm')
      copyFileSync(process.execPath, npmExecPath)
      const args = ['--eval', 'console.log(JSON.stringify(process.argv.slice(1))); process.exit(7)', '参数 & space', 'C:\\path\\file']
      const command = createPnpmCommand(args, { npmExecPath })
      const result = spawnSync(command.command, command.args, { shell: command.shell, encoding: 'utf8' })
      expect(result.error).toBeUndefined()
      expect(result.status, result.stderr).toBe(7)
      expect(JSON.parse(result.stdout)).toEqual(args.slice(2))
    }
    finally { rmSync(root, { recursive: true, force: true }) }
  })
})
