import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update rax', () => {
  const caseName = resolveCaseName()
  const target = 'rax' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips rax watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for rax', async () => {
    await runHotUpdateTarget(target)
  })
})
