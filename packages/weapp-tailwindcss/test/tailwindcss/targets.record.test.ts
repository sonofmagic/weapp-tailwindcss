import type { TailwindcssPatcherLike } from '@/types'
import { mkdtempSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { logger } from '@weapp-tailwindcss/logger'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { md5Hash } from '@/cache/md5'
import {
  __resetPatchTargetRecordWarningsForTests,
  createPatchTargetRecorder,
  saveCliPatchTargetRecord,
} from '@/tailwindcss/targets'
import { readPatchTargetRecord } from '@/tailwindcss/targets/record-io'

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

  it('reads valid records and ignores missing base directories', async () => {
    const recordFile = path.join(workspaceRoot, 'node_modules/.cache/weapp-tailwindcss/tailwindcss-target.json')
    await mkdir(path.dirname(recordFile), { recursive: true })
    await writeFile(recordFile, `${JSON.stringify({
      tailwindPackagePath: path.join(workspaceRoot, 'node_modules/tailwindcss'),
      packageVersion: '4.0.0',
    })}\n`, 'utf8')

    expect(readPatchTargetRecord()).toBeUndefined()
    const result = readPatchTargetRecord(workspaceRoot)

    expect(result?.baseDir).toBe(path.normalize(workspaceRoot))
    expect(result?.path).toBe(recordFile)
    expect(result?.record.tailwindPackagePath).toBe(path.join(workspaceRoot, 'node_modules/tailwindcss'))
  })

  it('warns once for invalid records missing tailwindPackagePath', async () => {
    const recordFile = path.join(workspaceRoot, 'node_modules/.cache/weapp-tailwindcss/tailwindcss-target.json')
    await mkdir(path.dirname(recordFile), { recursive: true })
    await writeFile(recordFile, `${JSON.stringify({
      packageVersion: '4.0.0',
    })}\n`, 'utf8')
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})

    expect(readPatchTargetRecord(workspaceRoot)).toBeUndefined()
    expect(readPatchTargetRecord(workspaceRoot)).toBeUndefined()

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('缺少 tailwindPackagePath 字段')
  })

  it('saves cli patch target records with custom metadata', async () => {
    const recordPath = path.join(workspaceRoot, 'custom', 'tailwindcss-target.json')
    const patcher = {
      packageInfo: {
        rootPath: path.join(workspaceRoot, 'node_modules/tailwindcss'),
        version: '4.0.0',
      },
    } as TailwindcssPatcherLike

    const savedPath = await saveCliPatchTargetRecord(workspaceRoot, patcher, {
      cwd: path.join(workspaceRoot, 'apps/demo'),
      packageJsonPath: path.join(workspaceRoot, 'package.json'),
      recordKey: 'custom-key',
      recordPath,
      source: 'runtime',
    })
    const record = JSON.parse(await readFile(recordPath, 'utf8'))

    expect(savedPath).toBe(recordPath)
    expect(record).toMatchObject({
      tailwindPackagePath: path.normalize(patcher.packageInfo!.rootPath!),
      packageVersion: '4.0.0',
      source: 'runtime',
      tailwindcssBasedir: path.normalize(workspaceRoot),
      cwd: path.normalize(path.join(workspaceRoot, 'apps/demo')),
      packageJsonPath: path.join(workspaceRoot, 'package.json'),
      recordKey: 'custom-key',
    })
    expect(record.recordedAt).toEqual(expect.any(String))
    expect(record.patchVersion).toEqual(expect.any(String))
  })

  it('skips saving when required inputs are missing and warns on write failures', async () => {
    const patcher = {
      packageInfo: {
        rootPath: path.join(workspaceRoot, 'node_modules/tailwindcss'),
        version: '4.0.0',
      },
    } as TailwindcssPatcherLike
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {})
    const recordDirectory = path.join(workspaceRoot, 'record-as-directory')
    await mkdir(recordDirectory, { recursive: true })

    await expect(saveCliPatchTargetRecord(undefined, patcher)).resolves.toBeUndefined()
    await expect(saveCliPatchTargetRecord(workspaceRoot, undefined)).resolves.toBeUndefined()
    await expect(saveCliPatchTargetRecord(workspaceRoot, {
      packageInfo: {},
    } as TailwindcssPatcherLike)).resolves.toBeUndefined()
    await expect(saveCliPatchTargetRecord(workspaceRoot, patcher, {
      recordPath: recordDirectory,
    })).resolves.toBeUndefined()

    expect(warnSpy).toHaveBeenCalledWith(
      '自动更新 Tailwind CSS 补丁记录失败，请在 %s 运行 "weapp-tw patch --cwd %s"。',
      expect.any(String),
      path.normalize(workspaceRoot),
    )
    expect(debugSpy).toHaveBeenCalledWith(
      'failed to persist patch target record %s: %O',
      path.normalize(recordDirectory),
      expect.any(Error),
    )
  })
})
