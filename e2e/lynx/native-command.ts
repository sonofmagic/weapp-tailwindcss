import process from 'node:process'
import { execa } from 'execa'

export async function command(name: string, args: string[], cwd: string, timeout = 300_000) {
  const result = await execa(name, args, {
    all: true,
    cwd,
    env: name === (process.env['LYNX_GRADLE'] ?? 'gradle') && process.env['LYNX_JAVA_HOME']
      ? { JAVA_HOME: process.env['LYNX_JAVA_HOME'] }
      : undefined,
    timeout,
  })
  return result.all ?? ''
}
