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

  it('falls back to the pnpm executable when npm_execpath is native', () => {
    expect(createPnpmCommand(['exec', 'vite'], {
      platform: 'linux',
      execPath: '/usr/bin/node',
      npmExecPath: '/opt/pnpm/pnpm',
    })).toEqual({
      command: 'pnpm',
      args: ['exec', 'vite'],
      shell: false,
    })
  })
})
