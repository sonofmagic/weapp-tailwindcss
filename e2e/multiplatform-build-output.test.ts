import { describe, expect, it } from 'vitest'
import { getMultiplatformBuildOutputCases, MULTIPLATFORM_BUILD_OUTPUT_CASES } from './multiplatform-build-output/cases'
import { verifyBuildOutputCase } from './multiplatform-build-output/runner'

describe('multiplatform build output smoke', () => {
  it('keeps case names unique and local-only cases documented', () => {
    const names = MULTIPLATFORM_BUILD_OUTPUT_CASES.map(item => item.name)
    expect(new Set(names).size).toBe(names.length)

    const frameworks = new Set(MULTIPLATFORM_BUILD_OUTPUT_CASES.map(item => item.framework))
    expect(frameworks).toEqual(new Set(['uni-app', 'uni-app-x', 'taro', 'mpx']))

    for (const item of MULTIPLATFORM_BUILD_OUTPUT_CASES.filter(item => item.status === 'local')) {
      expect(item.reason?.length, `${item.name} should document why it is not in CI`).toBeGreaterThan(0)
    }
  })

  it.each(getMultiplatformBuildOutputCases())('$name', async (item) => {
    await verifyBuildOutputCase(item)
  }, 1_200_000)
})
