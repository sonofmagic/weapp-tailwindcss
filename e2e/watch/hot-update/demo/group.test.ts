import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunGroupedTarget } from '../shared'

describe('e2e watch hot-update demo group', () => {
  const caseName = resolveCaseName()
  const target = 'demo' as const

  if (!shouldRunGroupedTarget(caseName, target)) {
    it.skip('skips demo watch hot-update group for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for demo group', async () => {
    await runHotUpdateTarget(target)
  })
})
