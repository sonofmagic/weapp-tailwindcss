import { isWatchReadyOutput, resolveWatchPlatform } from '../../../../scripts/weapp-vite-e2e-watch.mjs'
import { buildDemoBaseCases } from '../../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/base'

describe('weapp-vite e2e watch platform', () => {
  it('defaults to the mini-program platform used by the output assertions', () => {
    expect(resolveWatchPlatform({})).toBe('weapp')
  })

  it.each(['weapp', 'web', 'all'] as const)('accepts the explicit %s platform', (platform) => {
    expect(resolveWatchPlatform({
      WEAPP_VITE_E2E_WATCH_PLATFORM: platform,
    })).toBe(platform)
  })

  it('rejects unsupported platforms before starting the watcher', () => {
    expect(() => resolveWatchPlatform({
      WEAPP_VITE_E2E_WATCH_PLATFORM: 'unknown',
    })).toThrow('Unsupported WEAPP_VITE_E2E_WATCH_PLATFORM: unknown')
  })

  it('waits for the actual build-ready signal before mutating sources', () => {
    expect(isWatchReadyOutput('根据 Vite 项目根目录自动推断 appType -> weapp-vite')).toBe(false)
    expect(isWatchReadyOutput('开发服务已就绪')).toBe(true)
  })

  it('locks the fallback-build regression case to classic HMR', () => {
    const watchCase = buildDemoBaseCases('/repository').find(item => item.name === 'weapp-vite-tailwindcss-v4')

    expect(watchCase?.env).toMatchObject({
      WEAPP_VITE_E2E_WATCH_BUILD_FALLBACK: '1',
      WEAPP_VITE_E2E_WATCH_HMR_RUNTIME: 'classic',
    })
    expect(watchCase?.maxPluginProcessMs).toBe(1_000)
  })
})
