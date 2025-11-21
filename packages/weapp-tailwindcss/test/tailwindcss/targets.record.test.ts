import type { TailwindcssPatcherLike } from '@/types'
import { mkdtempSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { logger } from '@weapp-tailwindcss/logger'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetPatchTargetRecordWarningsForTests, warnIfCliPatchTargetMismatch } from '@/tailwindcss/targets'

describe('tailwindcss target records', () => {
  let workspaceRoot: string

  beforeEach(() => {
    workspaceRoot = mkdtempSync(path.join(os.tmpdir(), 'wtw-targets-'))
  })

  afterEach(async () => {
    await rm(workspaceRoot, { recursive: true, force: true })
    vi.restoreAllMocks()
    __resetPatchTargetRecordWarningsForTests()
  })

  it('warns when CLI patch target differs and record is located in an ancestor directory', async () => {
    const appDir = path.join(workspaceRoot, 'apps/demo')
    await mkdir(appDir, { recursive: true })

    const recordDir = workspaceRoot
    const recordedTailwind = path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@3.4.0/node_modules/tailwindcss')
    const runtimeTailwind = path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@4.0.0/node_modules/tailwindcss')

    const recordFile = path.join(recordDir, 'node_modules/.cache/weapp-tailwindcss/tailwindcss-target.json')
    await mkdir(path.dirname(recordFile), { recursive: true })
    await writeFile(recordFile, `${JSON.stringify({
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

    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})

    warnIfCliPatchTargetMismatch(appDir, patcher)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const message = warnSpy.mock.calls[0][0] as string
    expect(message).toContain('Tailwind CSS 目标不一致')
    expect(message).toContain('pnpm --filter')
  })

  it('still reads legacy .tw-patch target records', async () => {
    const appDir = path.join(workspaceRoot, 'apps/legacy')
    await mkdir(appDir, { recursive: true })

    const recordDir = workspaceRoot
    const recordedTailwind = path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@3.3.0/node_modules/tailwindcss')
    const runtimeTailwind = path.join(workspaceRoot, 'node_modules/.pnpm/tailwindcss@4.0.0/node_modules/tailwindcss')

    const recordFile = path.join(recordDir, '.tw-patch/tailwindcss-target.json')
    await mkdir(path.dirname(recordFile), { recursive: true })
    await writeFile(recordFile, `${JSON.stringify({
      tailwindPackagePath: recordedTailwind,
      packageVersion: '3.3.0',
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

    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})

    warnIfCliPatchTargetMismatch(appDir, patcher)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const message = warnSpy.mock.calls[0][0] as string
    expect(message).toContain('Tailwind CSS 目标不一致')
    expect(message).toContain('.tw-patch')
  })

  it('warns and skips corrupted record files', async () => {
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

    warnIfCliPatchTargetMismatch(appDir, patcher)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const message = warnSpy.mock.calls[0][0] as string
    expect(message).toContain('损坏的 Tailwind CSS 目标记录')
    expect(message).toContain('weapp-tw patch --record-target')
  })
})
