import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { command } from './lynx/native-command'

describe('Lynx native command diagnostics', () => {
  it('preserves timeout details even when the child produces no output', async () => {
    await expect(command(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], process.cwd(), 500))
      .rejects
      .toMatchObject({ timedOut: true, message: expect.stringContaining('timed out') })
  })

  it('preserves the exit status of a silent failure', async () => {
    await expect(command(process.execPath, ['-e', 'process.exit(7)'], process.cwd()))
      .rejects
      .toMatchObject({ exitCode: 7, message: expect.stringContaining('exit code 7') })
  })

  it('preserves native error output and successful command output', async () => {
    await expect(command(process.execPath, ['-e', 'console.error("native launch failed"); process.exit(1)'], process.cwd()))
      .rejects
      .toMatchObject({ stderr: 'native launch failed' })
    await expect(command(process.execPath, ['-e', 'console.log("ready")'], process.cwd())).resolves.toBe('ready')
  })
})
