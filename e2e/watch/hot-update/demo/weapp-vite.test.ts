import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update weapp-vite', () => {
  const caseName = resolveCaseName()
  const target = 'weapp-vite' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips weapp-vite watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for weapp-vite', async () => {
    await runHotUpdateTarget(target)
  })
})
