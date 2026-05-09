import { describe, it } from 'vitest'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

describe('e2e watch hot-update gulp-app', () => {
  const caseName = resolveCaseName()
  const target = 'gulp-app' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips gulp-app watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for gulp-app', async () => {
    await runHotUpdateTarget(target)
  })
})
