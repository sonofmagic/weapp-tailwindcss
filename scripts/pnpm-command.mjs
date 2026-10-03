import { Buffer } from 'node:buffer'
import { closeSync, openSync, readSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function isNodeScript(file) {
  if (/\.(?:c|m)?js$/i.test(file)) {
    return true
  }
  let descriptor
  try {
    descriptor = openSync(file, 'r')
    const buffer = Buffer.alloc(256)
    const length = readSync(descriptor, buffer, 0, buffer.length, 0)
    return /^#![^\r\n]*\bnode(?:\s|$)/.test(buffer.toString('utf8', 0, length))
  }
  catch {
    return false
  }
  finally {
    if (descriptor !== undefined) {
      closeSync(descriptor)
    }
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

  const paths = platform === 'win32' ? path.win32 : path.posix
  const activeCli = npmExecPath && /^(?:pnpm(?:-native)?(?:\.exe)?|pnpm\.(?:c|m)?js)$/i.test(paths.basename(npmExecPath))
    ? paths.resolve(npmExecPath)
    : undefined
  if (activeCli) {
    const script = isNodeScript(activeCli)
    return {
      command: script ? execPath : activeCli,
      args: script ? [activeCli, ...args] : args,
      shell: false,
    }
  }

  return {
    command: platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    args,
    shell: platform === 'win32',
  }
}
