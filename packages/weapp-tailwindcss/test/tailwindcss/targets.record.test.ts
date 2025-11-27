import type { TailwindcssPatcherLike } from '@/types'
import { mkdtempSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { logger } from '@weapp-tailwindcss/logger'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { md5Hash } from '@/cache/md5'
import { __resetPatchTargetRecordWarningsForTests, createPatchTargetRecorder } from '@/tailwindcss/targets'

describe('tailwindcss target records', () => {
  let workspaceRoot: string

  beforeEach(async () => {
    workspaceRoot = mkdtempSync(path.join(os.tmpdir(), 'wtw-targets-'))
    await writeFile(path.join(workspaceRoot, 'package.json'), JSON.stringify({ name: 'fixture' }))
  })

  afterEach(async () => {
    await rm(workspaceRoot, { recursive: true, force: true })
    vi.restoreAllMocks()
    __resetPatchTargetRecordWarningsForTests()
  })

  it('creates a recorder when cached target mismatches and re-records into isolated cache', async () => {
    const appDir = path.join(workspaceRoot, 'apps/demo')
    await mkdir(appDir, { recursive: true })

    const recordDir = workspaceRoot
    const recordedTailwind = path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@3.4.0/node_modules/tailwindcss')
    const runtimeTailwind = path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@4.0.0/node_modules/tailwindcss')

    const legacyRecord = path.join(recordDir, 'node_modules/.cache/weapp-tailwindcss/tailwindcss-target.json')
    await mkdir(path.dirname(legacyRecord), { recursive: true })
    await writeFile(legacyRecord, `${JSON.stringify({
      tailwindPackagePath: recordedTailwind,
      packageVersion: '3.4.0',
      recordedAt: new Date().toISOString(),
      source: 'cli',
      tailwindcssBasedir: recordDir,
    }, null, 2)}\n`, 'utf8')

    const patcher = {
      packageInfo: {
        rootPath: runtimeTailwind,
        version: '4.0.0',
      },
    } as TailwindcssPatcherLike

    const recorder = createPatchTargetRecorder(appDir, patcher, { source: 'runtime', cwd: appDir })
    expect(recorder?.reason).toBe('mismatch')
    expect(recorder?.message).toContain('自动重新 patch')

    const recordPath = await recorder?.onPatched()
    expect(recordPath).toBeTruthy()

    const expectedHash = md5Hash(path.join(workspaceRoot, 'package.json'))
    expect(recordPath).toContain(path.join('.cache', 'weapp-tailwindcss', expectedHash, 'tailwindcss-target.json'))

    const record = JSON.parse(await readFile(recordPath!, 'utf8'))
    expect(record.tailwindPackagePath).toBe(path.normalize(runtimeTailwind))
    expect(record.cwd).toBe(path.normalize(appDir))
    expect(record.patchVersion).toBeDefined()
  })

  it('migrates legacy .tw-patch records', async () => {
    const appDir = path.join(workspaceRoot, 'apps/legacy')
    await mkdir(appDir, { recursive: true })

    const recordFile = path.join(workspaceRoot, '.tw-patch/tailwindcss-target.json')
    await mkdir(path.dirname(recordFile), { recursive: true })
    await writeFile(recordFile, `${JSON.stringify({
      tailwindPackagePath: path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@3.3.0/node_modules/tailwindcss'),
      packageVersion: '3.3.0',
      recordedAt: new Date().toISOString(),
      source: 'cli',
      tailwindcssBasedir: workspaceRoot,
    }, null, 2)}\n`, 'utf8')

    const runtimeTailwind = path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@3.3.0/node_modules/tailwindcss')
    const patcher = {
      packageInfo: {
        rootPath: runtimeTailwind,
        version: '3.3.0',
      },
    } as TailwindcssPatcherLike

    const recorder = createPatchTargetRecorder(appDir, patcher, { source: 'runtime', cwd: appDir })
    expect(recorder?.reason).toBe('migrate')
    const recordPath = await recorder?.onPatched()
    expect(recordPath).toBeTruthy()
    const record = JSON.parse(await readFile(recordPath!, 'utf8'))
    expect(record.source).toBe('runtime')
    expect(record.recordKey).toBeDefined()
  })

  it('warns about corrupted records and continues', async () => {
    const appDir = path.join(workspaceRoot, 'apps/broken')
    await mkdir(appDir, { recursive: true })

    const recordFile = path.join(workspaceRoot, 'node_modules/.cache/weapp-tailwindcss/tailwindcss-target.json')
    await mkdir(path.dirname(recordFile), { recursive: true })
    await writeFile(recordFile, '{ invalid json', 'utf8')

    const patcher = {
      packageInfo: {
        rootPath: path.join(workspaceRoot, 'node_modules/tailwindcss'),
        version: '4.0.0',
      },
    } as TailwindcssPatcherLike

    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})

    const recorder = createPatchTargetRecorder(appDir, patcher, { source: 'runtime', cwd: appDir })
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('损坏的 Tailwind CSS 目标记录')
    expect(recorder).toBeTruthy()
  })
})
