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
  closeProject: vi.fn(),
  cleanupAlias: vi.fn(),
  closeError: false,
  logCloseError: false,
  launch: vi.fn(),
  screenshot: vi.fn(),
  restart: 'mutation' as 'mutation' | 'screenshot' | 'none',
}))
vi.mock('node:child_process', async importOriginal => ({
  ...await importOriginal<typeof import('node:child_process')>(),
  spawnSync: (_command: string, args: string[]) => {
    if (args.includes('list')) {
      return { status: 0, stdout: JSON.stringify({ devices: { ios: [
        { udid: 'first-simulator', state: 'Booted' },
        { udid: 'second-simulator', state: 'Booted' },
      ] } }), stderr: '' }
    }
    if (args[0] === 'devices') {
      return { status: 0, stdout: 'emulator-5554 device\n', stderr: '' }
    }
    if (args.includes('screenshot')) {
      state.screenshot(args)
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
    run: async (options: { args: string[], allowFailure?: boolean }) => {
      if (options.args[1] === 'close') {
        state.closeProject(options)
        if (state.closeError && !options.allowFailure) {
          throw new Error('模拟项目关闭失败')
        }
      }
    },
    spawn: (options: unknown) => {
      state.launch(options)
      return { child: state.child }
    },
  }),
  fileExists: async () => true,
  hbuilderxAppTimeoutMs: 1000,
  killProcessTree: () => {},
  pollIntervalMs: 1,
  readUtf8: (file: string) => readFile(file, 'utf8'),
  wait: async () => {},
}))
vi.mock('./hbuilderx-local/native-log', () => ({ captureNativeLog: () => ({ close: async () => {
  if (state.logCloseError) {
    throw new Error('模拟日志关闭失败')
  }
} }) }))
vi.mock('../scripts/demo-visual-e2e-report/harmony-output', () => ({ finalizeHarmonyAppOutput: async () => {} }))
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
  createHBuilderXProjectAlias: async (projectPath: string) => ({ projectPath, cleanup: state.cleanupAlias }),
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
    vi.unstubAllEnvs()
  })

  it.each((['app-android', 'app-ios'] as const).flatMap(platform =>
    (['mutation', 'screenshot', 'none'] as const).flatMap(restart =>
      (['none', 'close', 'log-close'] as const).map(cleanup => ({ platform, restart, cleanup }))),
  ))('$platform 视觉入口检查 $restart 与 $cleanup 收尾', async ({ platform, restart, cleanup }) => {
    state.restart = restart
    state.closeError = cleanup !== 'none'
    state.logCloseError = cleanup === 'log-close'
    for (const key of ['E2E_HBUILDERX_ANDROID_DEVICE_ID', 'E2E_HBUILDERX_ANDROID_SCREENSHOT_DEVICE_ID', 'ANDROID_SERIAL']) {
      vi.stubEnv(key, 'emulator-5554')
    }
    vi.stubEnv('E2E_HBUILDERX_IOS_TARGET', 'simulator')
    vi.stubEnv('E2E_HBUILDERX_IOS_DEVICE_ID', 'second-simulator')
    vi.stubEnv('E2E_HBUILDERX_IOS_SCREENSHOT_TARGET', 'second-simulator')
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
    expect(results[0]).toMatchObject({ status: restart === 'none' && cleanup === 'none' ? 'passed' : 'failed' })
    if (restart !== 'none') {
      expect(results[0].error).toContain('restarted')
    }
    if (cleanup !== 'none') {
      expect(results[0].error).toContain('模拟项目关闭失败')
      expect(state.cleanupAlias).not.toHaveBeenCalled()
    }
    if (cleanup === 'log-close') {
      expect(results[0].error).toContain('模拟日志关闭失败')
    }
    expect(state.closeProject).toHaveBeenCalledWith(expect.objectContaining({ allowFailure: false }))
    expect(await readFile(sourceFile, 'utf8')).toBe('original source')
    expect(state.child.stdout!.listenerCount('data')).toBe(0)
    if (platform === 'app-ios') {
      expect(state.launch).toHaveBeenCalledWith(expect.objectContaining({
        args: expect.arrayContaining(['--deviceId', 'second-simulator']),
      }))
      expect(state.screenshot).toHaveBeenCalledWith(expect.arrayContaining(['io', 'second-simulator', 'screenshot']))
    }
  })
})
