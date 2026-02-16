import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update uni-app-vue3-vite', () => {
  const caseName = resolveCaseName()
  const target = 'uni-app-vue3-vite' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips uni-app-vue3-vite watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for uni-app-vue3-vite', async () => {
    await runHotUpdateTarget(target)
  })
})
