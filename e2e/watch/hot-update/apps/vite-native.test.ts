import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update vite-native', () => {
  const caseName = resolveCaseName()
  const target = 'vite-native' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips vite-native watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for vite-native', async () => {
    await runHotUpdateTarget(target)
  })
})
