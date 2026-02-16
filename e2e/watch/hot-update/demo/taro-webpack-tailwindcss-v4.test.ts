import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update taro-webpack-tailwindcss-v4', () => {
  const caseName = resolveCaseName()
  const target = 'taro-webpack-tailwindcss-v4' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips taro-webpack-tailwindcss-v4 watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for taro-webpack-tailwindcss-v4', async () => {
    await runHotUpdateTarget(target)
  })
})
