import process from 'node:process'
import { execa } from 'execa'

export async function command(name: string, args: string[], cwd: string, timeout = 300_000) {
  const javaHome = process.env['LYNX_JAVA_HOME']
  const result = await execa(name, args, {
    all: true,
    cwd,
    ...(name === (process.env['LYNX_GRADLE'] ?? 'gradle') && javaHome ? { env: { JAVA_HOME: javaHome } } : {}),
    timeout,
  })
  return result.all ?? ''
}
