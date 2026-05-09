import fs from 'node:fs'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { FRAMEWORK_SUPPORT_CASES, getFrameworkCiCases, getFrameworkIdeExemptCases } from './frameworkSupportMatrix'

const describeFrameworkCi = process.env['E2E_FRAMEWORK_SUPPORT'] === '1' ? describe : describe.skip

describeFrameworkCi('framework support matrix ci', () => {
  it('keeps support case names unique and IDE exemptions explicit', () => {
    const names = FRAMEWORK_SUPPORT_CASES.map(item => item.name)
    expect(new Set(names).size).toBe(names.length)

    for (const entry of getFrameworkIdeExemptCases()) {
      expect(entry.ide.reason?.length).toBeGreaterThan(0)
    }
    for (const entry of FRAMEWORK_SUPPORT_CASES.filter(item => item.ci.tier === 'exempt')) {
      expect(entry.ci.reason?.length).toBeGreaterThan(0)
    }
  })

  it('covers every required framework support case with static e2e fixtures', () => {
    for (const entry of getFrameworkCiCases()) {
      const projectName = entry.project.name
      const snapshotProjectName = entry.snapshotProjectName ?? projectName

      expect(
        fs.existsSync(path.resolve(__dirname, `${projectName}.test.ts`)),
        `${entry.name} should have a static e2e test file`,
      ).toBe(true)
      expect(
        fs.existsSync(path.resolve(__dirname, '__snapshots__/e2e', snapshotProjectName)),
        `${entry.name} should have static e2e snapshots`,
      ).toBe(true)
    }
  })

  for (const entry of getFrameworkCiCases()) {
    it(`${entry.name} declares a supported ${entry.framework} fixture`, () => {
      expect(entry.ci.tier).toBe('required')
      expect(entry.framework.length).toBeGreaterThan(0)
      expect(entry.builder.length).toBeGreaterThan(0)
      expect(entry.project.cssFile.length).toBeGreaterThan(0)
    })
  }
})
