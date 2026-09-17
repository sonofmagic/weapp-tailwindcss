import type { ChildProcess } from 'node:child_process'
import type { CaseResult } from '../scripts/demo-visual-e2e-report/types'
import type { AppCase } from './hbuilderx-local/cases'
import { ChildProcess as TestChild } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { PNG } from 'pngjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { runAppCase } from '../scripts/demo-visual-e2e-report/app'

const state = vi.hoisted(() => ({
  child: undefined as ChildProcess | undefined,
  capture: vi.fn(),
  restart: 'mutation' as 'mutation' | 'screenshot' | 'none',
}))
vi.mock('node:child_process', async importOriginal => ({
  ...await importOriginal<typeof import('node:child_process')>(),
  spawnSync: (_command: string, args: string[]) => {
    if (args.includes('screenshot')) {
      state.capture(args.at(-1))
    }
    return { status: 0, stdout: '', stderr: '' }
  },
}))
vi.mock('./hbuilderx-local/process', () => ({
  assertAndroidToolchain: () => ({}),
  assertIosSimulatorToolchain: () => {},
  collectProcessOutput: () => [],
  createLocalHBuilderXRunner: async () => ({
    run: async () => {},
    spawn: () => ({ child: state.child }),
  }),
  fileExists: async () => true,
  hbuilderxAppTimeoutMs: 1000,
  killProcessTree: () => {},
  pollIntervalMs: 1,
  readUtf8: (file: string) => readFile(file, 'utf8'),
  wait: async () => {},
}))
vi.mock('./hbuilderx-local/native-log', () => ({ captureNativeLog: () => ({ close: async () => {} }) }))
vi.mock('./hbuilderx-local/render-mode', () => ({
  resolveAppRuntimeLogContract: () => ({ contains: [], notContains: [] }),
  findForbiddenRuntimeLogs: () => [],
}))
vi.mock('./hbuilderx-local/app-output', () => ({ readExistingAppTransformedOutput: async () => 'compiled' }))
vi.mock('./hbuilderx-local/app-marker', () => ({
  removeLegacyAppMarkers: (source: string) => source,
  rewriteAppMarker: (_source: string, _anchors: string[], marker: { text: string }) => {
    if (marker.text === 'changed' && state.restart === 'mutation') {
      state.child!.stdout!.emit('data', '编译完成\n热更新传输完成\nApp Launch at App.uvue:6\n')
    }
    return marker.text
  },
}))
vi.mock('./hbuilderx-local/android-runtime', () => ({
  captureAndroidScreenshot: (file: string) => state.capture(file),
  resolveAdbCommand: () => 'adb',
  parseHexColorFromClass: () => undefined,
  readAndroidUiHierarchy: async () => '<node text="current page" />',
  isAndroidDebugShell: () => false,
}))
vi.mock('../scripts/hbuilderx-project-alias.mjs', () => ({
  createHBuilderXProjectAlias: async (projectPath: string) => ({ projectPath, cleanup: async () => {} }),
}))
vi.mock('../scripts/demo-visual-e2e-report/style-isolation', () => ({
  readManifest: async () => undefined,
  resolveStyleIsolationVariants: () => [{}],
}))

describe('App 视觉入口的原生 HMR 生命周期', () => {
  const directories: string[] = []
  afterEach(async () => {
    await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })))
    vi.clearAllMocks()
  })

  it.each((['app-android', 'app-ios'] as const).flatMap(platform =>
    (['mutation', 'screenshot', 'none'] as const).map(restart => ({ platform, restart })),
  ))('$platform 视觉入口检查 $restart 阶段的进程连续性', async ({ platform, restart }) => {
    state.restart = restart
    const directory = await mkdtemp(join(tmpdir(), 'app-visual-lifecycle-'))
    directories.push(directory)
    const sourceFile = join(directory, 'App.uvue')
    await writeFile(sourceFile, 'original source')
    state.child = Object.assign(new TestChild(), { stdout: new PassThrough(), stderr: new PassThrough(), exitCode: 0 })
    const image = new PNG({ width: 20, height: 20 })
    image.data.fill(100)
    // 测试夹具只模拟截图传输成功；生产截图入口没有替代图兜底。
    const { writeFileSync } = await import('node:fs')
    state.capture.mockImplementation((file: string) => {
      writeFileSync(file, PNG.sync.write(image))
      if (restart === 'screenshot' && state.capture.mock.calls.length === 2) {
        state.child!.stderr!.emit('data', 'App Launch at App.uvue:6\n')
      }
    })
    const item: AppCase = {
      name: 'visual-lifecycle',
      platform,
      projectDir: directory,
      outputDir: 'dist',
      sourceFile: 'App.uvue',
      markerAnchor: 'original source',
      markerClass: '',
      markerText: 'initial',
      hmrMarkerClass: '',
      hmrMarkerText: 'changed',
      requiredFiles: [],
      transformedContains: ['compiled'],
      hmrTransformedContains: ['compiled'],
    }
    const results: CaseResult[] = []
    await runAppCase(item, { repoRoot: directory, artifactRoot: join(directory, 'artifacts'), timeoutMs: 1000, viewport: { width: 20, height: 20 } }, results)
    expect(state.capture).toHaveBeenCalled()
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject(restart === 'none'
      ? { status: 'passed' }
      : { status: 'failed', error: expect.stringContaining('restarted') })
    expect(await readFile(sourceFile, 'utf8')).toBe('original source')
    expect(state.child.stdout!.listenerCount('data')).toBe(0)
  })
})
