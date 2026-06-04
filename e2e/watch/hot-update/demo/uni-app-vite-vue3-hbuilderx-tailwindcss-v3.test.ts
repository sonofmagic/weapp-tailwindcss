import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update uni-app-vite-vue3-hbuilderx-tailwindcss-v3', () => {
  const caseName = resolveCaseName()
  const target = 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips uni-app-vite-vue3-hbuilderx-tailwindcss-v3 watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for uni-app-vite-vue3-hbuilderx-tailwindcss-v3', async () => {
    await runHotUpdateTarget(target)
  })
})
