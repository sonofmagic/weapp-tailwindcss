import { resolveWatchPlatform } from '../../../../scripts/weapp-vite-e2e-watch.mjs'

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
})
