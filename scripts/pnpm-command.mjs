import path from 'node:path'
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
    const extension = (platform === 'win32' ? path.win32 : path.posix).extname(npmExecPath).toLowerCase()
    const javascript = ['.js', '.cjs', '.mjs'].includes(extension)
    return {
      command: javascript ? execPath : npmExecPath,
      args: javascript ? [npmExecPath, ...args] : args,
      shell: platform === 'win32' && ['.cmd', '.bat'].includes(extension),
    }
  }

  return {
    command: platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    args,
    shell: platform === 'win32',
  }
}
