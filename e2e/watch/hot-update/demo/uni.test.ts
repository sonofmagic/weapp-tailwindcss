import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update uni', () => {
  const caseName = resolveCaseName()
  const target = 'uni' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips uni watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for uni', async () => {
    await runHotUpdateTarget(target)
  })
})
