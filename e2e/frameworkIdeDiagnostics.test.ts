import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { collectFrameworkIdeDiagnostics } from './frameworkIdeDiagnostics'

const tempDirs: string[] = []

afterEach(async () => {
  delete process.env['E2E_IDE_DEVTOOLS_SUPPORT_DIR']
  delete process.env['E2E_IDE_DIAGNOSTIC_LOG_FILES']
  delete process.env['E2E_IDE_DIAGNOSTIC_LOG_LINES']
  delete process.env['E2E_IDE_DIAGNOSTIC_PROCESSES']
  delete process.env['E2E_IDE_DIAGNOSTIC_PROCESS_CHARS']
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('framework IDE diagnostics', () => {
  it('collects recent WeChat DevTools log tails for failed IDE probes', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-ide-diagnostics-'))
    tempDirs.push(tempDir)
    const logDir = path.join(tempDir, 'profile-id', 'WeappLog', 'logs')
    await mkdir(logDir, { recursive: true })
    await writeFile(path.join(tempDir, 'profile-id', 'WeappLog', 'stderr.log'), 'stderr-a\nstderr-b\nstderr-c\n')
    await writeFile(path.join(logDir, 'devtools.log'), 'log-a\nlog-b\nlog-c\n')

    process.env['E2E_IDE_DEVTOOLS_SUPPORT_DIR'] = tempDir
    process.env['E2E_IDE_DIAGNOSTIC_LOG_FILES'] = '2'
    process.env['E2E_IDE_DIAGNOSTIC_LOG_LINES'] = '2'
    process.env['E2E_IDE_DIAGNOSTIC_PROCESSES'] = '0'

    const diagnostics = await collectFrameworkIdeDiagnostics('fixture-case')

    expect(diagnostics).toContain('[e2e:ide] diagnostics for fixture-case')
    expect(diagnostics).toContain('[devtools log:')
    expect(diagnostics).toContain('stderr-b')
    expect(diagnostics).toContain('stderr-c')
    expect(diagnostics).toContain('log-b')
    expect(diagnostics).toContain('log-c')
    expect(diagnostics).not.toContain('stderr-a')
    expect(diagnostics).not.toContain('log-a')
  })
})
