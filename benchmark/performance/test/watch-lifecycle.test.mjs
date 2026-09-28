import { readFile } from 'node:fs/promises'
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
      runs: 3,
    })
    expect(report.samples).toHaveLength(3)
    expect(new Set(report.samples.map(sample => sample.outputHash)).size).toBe(1)
    expect(report.time.count).toBe(3)
    expect(report.outputCss).toBe(await readFile(new URL(`./fixtures/watch/${kind}.css`, import.meta.url), 'utf8'))
  }, 30000)
})
