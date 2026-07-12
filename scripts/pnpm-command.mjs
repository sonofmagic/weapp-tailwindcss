import process from 'node:process'

export function createPnpmCommand(
  args,
  options = {},
) {
  const platform = options.platform ?? process.platform
  const execPath = options.execPath ?? process.execPath
  const npmExecPath = Object.hasOwn(options, 'npmExecPath')
    ? options.npmExecPath
    : process.env.npm_execpath

  if (npmExecPath) {
    return {
      command: execPath,
      args: [npmExecPath, ...args],
      shell: false,
    }
  }

  return {
    command: platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    args,
    shell: platform === 'win32',
  }
}
