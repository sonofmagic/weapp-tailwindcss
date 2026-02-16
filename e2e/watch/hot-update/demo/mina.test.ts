import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update mina', () => {
  const caseName = resolveCaseName()
  const target = 'mina' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips mina watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for mina', async () => {
    await runHotUpdateTarget(target)
  })
})
