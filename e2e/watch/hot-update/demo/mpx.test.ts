import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update mpx', () => {
  const caseName = resolveCaseName()
  const target = 'mpx' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips mpx watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for mpx', async () => {
    await runHotUpdateTarget(target)
  })
})
