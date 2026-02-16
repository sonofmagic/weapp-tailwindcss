import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update taro-vue3-app', () => {
  const caseName = resolveCaseName()
  const target = 'taro-vue3-app' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips taro-vue3-app watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for taro-vue3-app', async () => {
    await runHotUpdateTarget(target)
  })
})
