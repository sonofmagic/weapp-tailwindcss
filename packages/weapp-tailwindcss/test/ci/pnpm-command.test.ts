import { createPnpmCommand } from '../../../../scripts/pnpm-command.mjs'

describe('pnpm command', () => {
  it('reuses the active pnpm cli through node when npm_execpath is available', () => {
    expect(createPnpmCommand(['build'], {
      platform: 'win32',
      execPath: 'C:\\node\\node.exe',
      npmExecPath: 'C:\\pnpm\\pnpm.cjs',
    })).toEqual({
      command: 'C:\\node\\node.exe',
      args: ['C:\\pnpm\\pnpm.cjs', 'build'],
      shell: false,
    })
  })

  it('uses a shell for the Windows cmd fallback', () => {
    expect(createPnpmCommand(['build'], {
      platform: 'win32',
      execPath: 'C:\\node\\node.exe',
      npmExecPath: undefined,
    })).toEqual({
      command: 'pnpm.cmd',
      args: ['build'],
      shell: true,
    })
  })
})
