import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update taro-vite-react-tailwindcss-v3', () => {
  const caseName = resolveCaseName()
  const target = 'taro-vite-react-tailwindcss-v3' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips taro-vite-react-tailwindcss-v3 watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for taro-vite-react-tailwindcss-v3', async () => {
    await runHotUpdateTarget(target)
  })
})
