import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runCase } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/runner'
import type {
  CliOptions,
  MutationRoundMetrics,
  WatchCase,
  WatchSession,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'

const createWatchSessionMock = vi.fn<() => WatchSession>()
const runClassMutationMock = vi.fn()
const runStyleMutationMock = vi.fn()
const runMainStyleHotUpdateMock = vi.fn()

vi.mock('../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session', () => ({
  createWatchSession: () => createWatchSessionMock(),
  runPnpmCommand: vi.fn(),
  sleep: vi.fn(async () => {}),
}))

vi.mock('../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations', () => ({
  runClassMutation: (...args: unknown[]) => runClassMutationMock(...args),
  runMainStyleHotUpdate: (...args: unknown[]) => runMainStyleHotUpdateMock(...args),
  runStyleMutation: (...args: unknown[]) => runStyleMutationMock(...args),
  runSubPackageMutation: vi.fn(),
  waitForInitialWarmup: vi.fn(async () => 3),
  waitForOutputsReady: vi.fn(async () => 2),
}))

function createOptions(): CliOptions {
  return {
    caseName: 'all',
    timeoutMs: 1000,
    pollMs: 10,
    skipBuild: true,
    quietSass: true,
    webOnly: false,
    styleOnly: false,
    mainStyleOnly: false,
  }
}

function createRound(mutationKind: 'template' | 'script' | 'content'): MutationRoundMetrics {
  return {
    roundName: 'issue33-arbitrary',
    marker: `${mutationKind}-marker`,
    classLiteral: `${mutationKind}-class`,
    classTokens: [`${mutationKind}-class`],
    escapedClasses: [`${mutationKind}-class`],
    hotUpdateOutputMs: 10,
    hotUpdateEffectiveMs: 12,
    rollbackOutputMs: 8,
    rollbackEffectiveMs: 9,
    totalMs: 30,
  }
}

function createClassMetric(mutationKind: 'template' | 'script' | 'content', sourceFile: string) {
  const round = createRound(mutationKind)
  return {
    mutationKind,
    sourceFile,
    marker: round.marker,
    classLiteral: round.classLiteral,
    classTokens: round.classTokens,
    escapedClasses: round.escapedClasses,
    rounds: [round],
    verifyEscapedIn: ['js'],
    verifyClassLiteralIn: ['js'],
    globalStyleOutputs: [],
    minRequiredGlobalStyleEscapedClasses: 1,
    verifiedGlobalStyleEscapedClasses: [`${mutationKind}-class`],
    hotUpdateOutputMs: round.hotUpdateOutputMs,
    hotUpdateEffectiveMs: round.hotUpdateEffectiveMs,
    rollbackOutputMs: round.rollbackOutputMs,
    rollbackEffectiveMs: round.rollbackEffectiveMs,
  }
}

function createStyleMetric(sourceFile: string) {
  return {
    mutationKind: 'style',
    sourceFile,
    outputStyle: 'dist/app.wxss',
    marker: 'style-marker',
    styleNeedle: '.style-marker',
    outputNeedles: ['.style-marker'],
    rollbackNeedles: ['.style-marker'],
    applyUtilities: [],
    expectedApplyDeclarations: [],
    expectedApplyDeclarationGroups: [],
    functionDeclarations: [],
    expectedFunctionDeclarations: [],
    forbiddenFunctionFragments: [],
    hotUpdateOutputMs: 10,
    hotUpdateEffectiveMs: 12,
    hotUpdatePluginProcessMs: 0,
    hotUpdatePluginProcessSamples: [],
    rollbackOutputMs: 8,
    rollbackEffectiveMs: 9,
    rollbackPluginProcessMs: 0,
    rollbackPluginProcessSamples: [],
    rollbackNeedleCleared: true,
  }
}

describe('watch-hmr runner', () => {
  let tempDir = ''

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-runner-'))
    createWatchSessionMock.mockReset()
    runClassMutationMock.mockReset()
    runMainStyleHotUpdateMock.mockReset()
    runStyleMutationMock.mockReset()
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('runs content mutation after the primary HMR surfaces are warmed', async () => {
    const sourceFile = path.join(tempDir, 'index.tsx')
    const styleFile = path.join(tempDir, 'index.css')
    await writeFile(sourceFile, 'export default "anchor"\n', 'utf8')
    await writeFile(styleFile, '.anchor {}\n', 'utf8')
    const session: WatchSession = {
      child: {} as WatchSession['child'],
      ensureRunning: vi.fn(),
      lastCompileSuccessAt: vi.fn(() => 0),
      logs: vi.fn(() => 'watch logs'),
      memorySamplesSince: vi.fn(() => [
        { at: 1, rssMb: 100, maxProcessRssMb: 90, processCount: 2 },
        { at: 2, rssMb: 125, maxProcessRssMb: 110, processCount: 2 },
      ]),
      memoryDebugSamplesSince: vi.fn(() => [
        {
          at: 2,
          bundler: 'vite',
          phase: 'generateBundle',
          durationMs: 10,
          data: {
            process: {
              heapUsedMb: 64,
              rssMb: 125,
            },
          },
        },
      ]),
      stop: vi.fn(async () => {}),
      pluginProcessSamplesSince: vi.fn(() => []),
    }
    createWatchSessionMock.mockReturnValue(session)
    runClassMutationMock.mockImplementation((...args: unknown[]) => {
      const mutationKind = args[3] as 'template' | 'script' | 'content'
      return Promise.resolve(createClassMetric(mutationKind, sourceFile))
    })
    runStyleMutationMock.mockResolvedValue(createStyleMetric(styleFile))
    runMainStyleHotUpdateMock.mockResolvedValue({
      label: 'text-[102.43rpx] to text-[103.43rpx]',
      mutationKind: 'template',
      sourceFile,
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      fromClassToken: 'text-[102.43rpx]',
      toClassToken: 'text-[103.43rpx]',
      fromEscapedClass: 'text-_b_102_2e43rpx_B',
      toEscapedClass: 'text-_b_103_2e43rpx_B',
      verifiedGlobalStyleEscapedClasses: ['text-_b_103_2e43rpx_B'],
      minRequiredGlobalStyleEscapedClasses: 1,
      rollbackVerifiedGlobalStyleRemovedClasses: ['text-_b_103_2e43rpx_B'],
      hotUpdateOutputMs: 10,
      hotUpdateEffectiveMs: 12,
      hotUpdatePluginProcessMs: 2,
      hotUpdatePluginProcessSamples: [],
      rollbackOutputMs: 8,
      rollbackEffectiveMs: 9,
      rollbackPluginProcessMs: 1,
      rollbackPluginProcessSamples: [],
    })

    const watchCase: WatchCase = {
      name: 'taro-webpack-react-tailwindcss-v4',
      label: 'demo/taro-webpack-react-tailwindcss-v4',
      project: 'demo/taro-webpack-react-tailwindcss-v4',
      group: 'demo',
      cwd: tempDir,
      devScript: 'dev:e2e-watch',
      outputWxml: path.join(tempDir, 'dist/index.wxml'),
      outputJs: path.join(tempDir, 'dist/index.js'),
      outputStyleCandidates: [path.join(tempDir, 'dist/index.wxss')],
      globalStyleCandidates: [path.join(tempDir, 'dist/app.wxss')],
      contentMutation: {
        sourceFile,
        verifyEscapedIn: ['js'],
        mutate: source => source,
      },
      templateMutation: {
        sourceFile,
        verifyEscapedIn: ['js'],
        mutate: source => source,
      },
      scriptMutation: {
        sourceFile,
        verifyEscapedIn: ['js'],
        mutate: source => source,
      },
      styleMutation: {
        sourceFile: styleFile,
        mutate: source => source,
      },
    }

    const result = await runCase(watchCase, createOptions())

    expect(runClassMutationMock.mock.calls.map(call => call[3])).toEqual([
      'template',
      'script',
      'content',
    ])
    expect(runStyleMutationMock).toHaveBeenCalledTimes(1)
    expect(runClassMutationMock.mock.invocationCallOrder[2]).toBeGreaterThan(
      runStyleMutationMock.mock.invocationCallOrder[0]!,
    )
    expect(result.mutationMetrics.map(metric => metric.mutationKind)).toEqual([
      'template',
      'script',
      'style',
      'content',
    ])
    expect(result.memoryDebugSamples?.[0]?.data).toMatchObject({
      process: {
        heapUsedMb: 64,
        rssMb: 125,
      },
    })
    expect(session.stop).toHaveBeenCalledTimes(1)
  })
})
