import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CliOptions, WatchCase, WatchSession } from '../scripts/watch-hmr-regression/types'

const createWatchSessionMock = vi.fn<() => WatchSession>()
const runStyleMutationMock = vi.fn()
const sleepMock = vi.fn<(ms: number) => Promise<void>>()

vi.mock('../scripts/watch-hmr-regression/session', () => ({
  createWatchSession: () => createWatchSessionMock(),
  sleep: (ms: number) => sleepMock(ms),
}))

vi.mock('../scripts/watch-hmr-regression/mutations/style', () => ({
  runStyleMutation: (...args: unknown[]) => runStyleMutationMock(...args),
}))

let tempDir: string

function createOptions(): CliOptions {
  return {
    caseName: 'all',
    timeoutMs: 1000,
    pollMs: 10,
    skipBuild: true,
    quietSass: true,
  }
}

function createWatchCase(sourceFile: string): WatchCase {
  return {
    name: 'taro-webpack',
    label: 'apps/taro-webpack-tailwindcss-v4',
    project: 'apps/taro-webpack-tailwindcss-v4',
    group: 'apps',
    cwd: '/repo/apps/taro-webpack-tailwindcss-v4',
    devScript: 'dev:weapp2',
    outputWxml: '/repo/dist/pages/index/index.wxml',
    outputJs: '/repo/dist/pages/index/index.js',
    outputStyleCandidates: ['/repo/dist/pages/index/index.wxss'],
    globalStyleCandidates: ['/repo/dist/app.wxss'],
    templateMutation: {
      sourceFile,
      verifyEscapedIn: [],
      mutate: source => source,
    },
    scriptMutation: {
      sourceFile,
      verifyEscapedIn: [],
      mutate: source => source,
    },
    styleMutation: {
      sourceFile,
      mutate: source => `${source}\n.tw-watch-style-case { color: red; }`,
    },
  }
}

describe('watch-hmr style-only helpers', () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-style-only-'))
    createWatchSessionMock.mockReset()
    runStyleMutationMock.mockReset()
    sleepMock.mockReset().mockResolvedValue()
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('runs style-only case and restores the source file', async () => {
    const sourceFile = path.join(tempDir, 'index.css')
    await writeFile(sourceFile, '.anchor {\n  color: inherit;\n}\n', 'utf8')
    const watchCase = createWatchCase(sourceFile)
    const session: WatchSession = {
      child: {} as WatchSession['child'],
      ensureRunning: vi.fn(),
      lastCompileSuccessAt: vi.fn(() => 0),
      logs: vi.fn(() => 'watch logs'),
      stop: vi.fn(async () => {}),
    }
    createWatchSessionMock.mockReturnValue(session)
    runStyleMutationMock.mockResolvedValue({
      mutationKind: 'style',
      sourceFile,
      outputStyle: '/repo/dist/pages/index/index.wxss',
      marker: 'style-marker',
      styleNeedle: '.style-marker',
      applyUtilities: [],
      expectedApplyDeclarations: [],
      hotUpdateOutputMs: 12,
      hotUpdateEffectiveMs: 10,
      rollbackOutputMs: 15,
      rollbackEffectiveMs: 11,
      rollbackNeedleCleared: true,
    })

    const { runStyleOnlyCase } = await import('../scripts/watch-hmr-regression/style-only')
    const result = await runStyleOnlyCase(watchCase, createOptions())

    expect(result).toMatchObject({
      name: 'taro-webpack',
      hotUpdateMs: 10,
      rollbackMs: 11,
      rollbackNeedleCleared: true,
      outputStyle: '/repo/dist/pages/index/index.wxss',
    })
    expect(session.ensureRunning).toHaveBeenCalled()
    expect(session.stop).toHaveBeenCalledTimes(1)
    expect(await readFile(sourceFile, 'utf8')).toBe('.anchor {\n  color: inherit;\n}\n')
  })

  it('still restores the source file and stops the session on failure', async () => {
    const sourceFile = path.join(tempDir, 'index.css')
    await writeFile(sourceFile, '.anchor {\n  color: inherit;\n}\n', 'utf8')
    const watchCase = createWatchCase(sourceFile)
    const session: WatchSession = {
      child: {} as WatchSession['child'],
      ensureRunning: vi.fn(),
      lastCompileSuccessAt: vi.fn(() => 0),
      logs: vi.fn(() => 'captured watch logs'),
      stop: vi.fn(async () => {}),
    }
    createWatchSessionMock.mockReturnValue(session)
    runStyleMutationMock.mockRejectedValue(new Error('style hot update failed'))

    const { runStyleOnlyCase } = await import('../scripts/watch-hmr-regression/style-only')

    await expect(runStyleOnlyCase(watchCase, createOptions())).rejects.toThrow(
      'style hot update failed\n[apps/taro-webpack-tailwindcss-v4] recent watch logs:\ncaptured watch logs',
    )
    expect(session.stop).toHaveBeenCalledTimes(1)
    expect(await readFile(sourceFile, 'utf8')).toBe('.anchor {\n  color: inherit;\n}\n')
  })
})
