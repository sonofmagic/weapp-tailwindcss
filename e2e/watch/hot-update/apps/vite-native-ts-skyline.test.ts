import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update vite-native-ts-skyline', () => {
  const caseName = resolveCaseName()
  const target = 'vite-native-ts-skyline' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips vite-native-ts-skyline watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for vite-native-ts-skyline', async () => {
    await runHotUpdateTarget(target)
  })
})
