import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { measureWatchLifecycle } from '../src/watch-lifecycle.mjs'

describe('真实 watcher 基准契约', () => {
  it.each(['vite', 'webpack'])('%s 连续变更后恢复一致产物', async (kind) => {
    const report = await measureWatchLifecycle({
      sourceRoot: fileURLToPath(new URL('../../..', import.meta.url)),
      kind,
      size: 3,
      warmups: 0,
      runs: 2,
    })
    expect(report.samples).toHaveLength(2)
    expect(report.samples[0].outputHash).toBe(report.samples[1].outputHash)
    expect(report.time.count).toBe(2)
  }, 30000)
})
