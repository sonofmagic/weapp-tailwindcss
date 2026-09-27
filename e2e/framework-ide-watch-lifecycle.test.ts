import { beforeEach, expect, it, vi } from 'vitest'
import { withFrameworkIdeHotUpdateProbe } from './frameworkIdeHotUpdate'

const state = vi.hoisted(() => ({ events: [] as string[], failWarmup: false }))
vi.mock('node:fs/promises', () => ({ default: { readFile: vi.fn(async () => 'original') } }))
vi.mock('../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases', () => ({
  buildCases: () => [{
    name: 'weapp-vite-tailwindcss-v4',
    label: 'fixture',
    cwd: 'fixture',
    devScript: 'dev',
    initialBuildScript: 'build',
    outputWxml: 'page.wxml',
    outputJs: 'page.js',
    skipStyleMutation: true,
    templateMutation: { sourceFile: 'page.wxml' },
    scriptMutation: { sourceFile: 'page.js' },
  }],
}))
vi.mock('../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session', () => ({
  runPnpmCommand: async () => { state.events.push('build') },
  createWatchSession: () => {
    state.events.push('watch:start')
    return {
      logs: () => '',
      ensureRunning: vi.fn(),
      stop: async () => { state.events.push('watch:stop') },
    }
  },
  sleep: vi.fn(),
}))
vi.mock('../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations', () => ({
  waitForOutputsReady: vi.fn(),
  waitForInitialWarmup: async () => {
    state.events.push('watch:ready')
    if (state.failWarmup) {
      throw new Error('compile failed')
    }
  },
}))
vi.mock('../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text', () => ({
  readFileIfExists: async () => 'output',
  getMtime: vi.fn(),
  waitFor: vi.fn(),
  writeFilePreserveEol: async () => { state.events.push('restore') },
}))
vi.mock('./frameworkIdeClassHotUpdate', () => ({
  runIdeClassHotUpdate: async (_options: unknown, _case: unknown, _session: unknown, kind: string) => { state.events.push(kind) },
}))
vi.mock('./frameworkIdeStyleHotUpdate', () => ({ runIdeStyleHotUpdate: vi.fn() }))

const entry = { name: 'weapp-vite-tailwindcss-v4' } as Parameters<typeof withFrameworkIdeHotUpdateProbe>[0]

beforeEach(() => {
  state.events = []
  state.failWarmup = false
})

it('首轮构建和 watch 就绪后才打开 IDE，所有增量操作共用该 watcher', async () => {
  await withFrameworkIdeHotUpdateProbe(entry, async (probe) => {
    state.events.push('ide:open')
    await probe({}, {}, '/page', 'fixture')
    state.events.push('ide:close')
  })
  expect(state.events).toEqual(['build', 'watch:start', 'watch:ready', 'ide:open', 'template', 'script', 'ide:close', 'restore', 'restore', 'watch:stop'])
})

it('首轮编译失败时不打开 IDE，仍回收 watcher', async () => {
  state.failWarmup = true
  const open = vi.fn()
  await expect(withFrameworkIdeHotUpdateProbe(entry, open)).rejects.toThrow('compile failed')
  expect(open).not.toHaveBeenCalled()
  expect(state.events.at(-1)).toBe('watch:stop')
})

it('运行时错误不会被清空或忽略，失败后恢复源码并关闭 watcher', async () => {
  const runtimeErrors = {
    assertNoErrors: async () => { throw new Error('component missing') },
  }
  await expect(withFrameworkIdeHotUpdateProbe(entry, async (probe) => {
    await probe({}, {}, '/page', 'fixture', runtimeErrors)
  })).rejects.toThrow('component missing')
  expect(state.events.slice(-3)).toEqual(['restore', 'restore', 'watch:stop'])
})
