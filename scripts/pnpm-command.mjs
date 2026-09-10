import { readFileSync } from 'node:fs'
import process from 'node:process'

function isNodeScript(file) {
  if (!file) {
    return false
  }
  try {
    const header = readFileSync(file, { encoding: 'utf8', flag: 'r' }).slice(0, 256)
    return header.startsWith('#!') || /\.(?:c|m)?js$/i.test(file)
  }
  catch {
    return /\.(?:c|m)?js$/i.test(file)
  }
}

export function createPnpmCommand(
  args,
  options = {},
) {
  const platform = options.platform ?? process.platform
  const execPath = options.execPath ?? process.execPath
  const npmExecPath = Object.hasOwn(options, 'npmExecPath')
    ? options.npmExecPath
    : process.env.npm_execpath

  if (npmExecPath && isNodeScript(npmExecPath)) {
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
