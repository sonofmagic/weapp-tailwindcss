import { describe, expect, it } from 'vitest'
import { getMultiplatformBuildOutputCases, MULTIPLATFORM_BUILD_OUTPUT_CASES } from './multiplatform-build-output/cases'
import { isMiniProgramTarget, uniqueTargetKey } from './multiplatform-build-output/helpers'
import { verifyBuildOutputCase } from './multiplatform-build-output/runner'
import { MULTIPLATFORM_TARGETS } from './multiplatform-build-output/targets'
import { E2E_PROJECTS } from './projectEntries'

describe('multiplatform build output smoke', () => {
  it('keeps full platform matrix covered and local-only cases documented', () => {
    const names = MULTIPLATFORM_BUILD_OUTPUT_CASES.map(item => item.name)
    expect(new Set(names).size).toBe(names.length)

    const frameworks = new Set(MULTIPLATFORM_BUILD_OUTPUT_CASES.map(item => item.framework))
    expect(frameworks).toEqual(new Set(['gulp', 'uni-app', 'uni-app-x', 'taro', 'mpx']))

    const caseKeys = new Set(MULTIPLATFORM_BUILD_OUTPUT_CASES.map(uniqueTargetKey))
    const targetKeys = new Set(MULTIPLATFORM_TARGETS.map(uniqueTargetKey))
    expect(caseKeys).toEqual(targetKeys)

    const casesByKey = new Map(MULTIPLATFORM_BUILD_OUTPUT_CASES.map(item => [uniqueTargetKey(item), item]))
    for (const target of MULTIPLATFORM_TARGETS) {
      const item = casesByKey.get(uniqueTargetKey(target))
      expect(item, `${target.projectDir} ${target.platform} should have a build output case`).toBeTruthy()

      if (target.coverage === 'default-ci') {
        expect(item?.status, `${target.projectDir} ${target.platform} should run in default CI`).toBe('ci')
      }
      else {
        expect(item?.status, `${target.projectDir} ${target.platform} should stay out of default CI`).toBe('local')
      }
    }

    for (const item of MULTIPLATFORM_BUILD_OUTPUT_CASES.filter(item => item.status === 'local')) {
      expect(item.reason?.length, `${item.name} should document why it is not in CI`).toBeGreaterThan(0)
    }

    for (const target of MULTIPLATFORM_TARGETS.filter(item => item.coverage === 'local')) {
      const item = casesByKey.get(uniqueTargetKey(target))
      if (item?.command[0] === 'node' && item.command.includes('process.exit(0)')) {
        expect(item.verifySourceFixtures, `${item.name} documented-only case should not verify source fixtures`).toBe(false)
      }
    }

    for (const item of MULTIPLATFORM_BUILD_OUTPUT_CASES.filter(item => item.status === 'ci')) {
      expect(item.styleFileExtensions?.length, `${item.name} should declare expected style output suffixes`).toBeGreaterThan(0)
    }

    const miniProgramCases = MULTIPLATFORM_BUILD_OUTPUT_CASES.filter(isMiniProgramTarget)
    expect(miniProgramCases.length).toBeGreaterThan(0)
    for (const item of miniProgramCases) {
      expect(item.forbidEmptyBlockAtRules, `${item.name} should guard every final style output`).toBe(true)
    }

    for (const item of MULTIPLATFORM_BUILD_OUTPUT_CASES.filter(item => /^(?:h5|quickapp)/.test(item.platform))) {
      expect(item.forbidEmptyBlockAtRules, `${item.name} web output should preserve legal empty conditional rules`).not.toBe(true)
    }

    expect(E2E_PROJECTS.every(item => item.forbidEmptyBlockAtRules)).toBe(true)
  })

  it.each(getMultiplatformBuildOutputCases())('$name', async (item) => {
    await verifyBuildOutputCase(item)
  }, 1_200_000)
})
