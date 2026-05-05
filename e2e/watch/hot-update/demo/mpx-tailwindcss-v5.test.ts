import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update mpx-tailwindcss-v5', () => {
  const caseName = resolveCaseName()
  const target = 'mpx-tailwindcss-v5' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips mpx-tailwindcss-v5 watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for mpx-tailwindcss-v5', async () => {
    await runHotUpdateTarget(target)
  })
})
