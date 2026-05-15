import fs from 'node:fs'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { buildCases } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'
import { HOT_UPDATE_CASES_BY_TARGET, HOT_UPDATE_CI_CASES, HOT_UPDATE_COVERED_PROJECTS, HOT_UPDATE_EXEMPT_PROJECTS } from './e2eMatrix'
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

  it('covers every required demo framework support case with watch hot-update or an explicit exemption', () => {
    for (const entry of getFrameworkCiCases().filter(item => item.fixturesDir === '../demo')) {
      const projectName = entry.project.name
      expect(
        HOT_UPDATE_COVERED_PROJECTS.has(projectName) || HOT_UPDATE_EXEMPT_PROJECTS.has(projectName),
        `${entry.name} should have demo watch hot-update coverage or an explicit exemption`,
      ).toBe(true)
    }
  })

  it('keeps stable demo hot-update cases wired into e2e:ci', () => {
    expect(HOT_UPDATE_CI_CASES).toEqual([
      ...HOT_UPDATE_CASES_BY_TARGET.demo,
    ])
  })

  it('keeps every demo hot-update case runnable from the e2e watch suite by name', () => {
    for (const caseName of HOT_UPDATE_CASES_BY_TARGET.demo) {
      expect(
        fs.existsSync(path.resolve(__dirname, `watch/hot-update/demo/${caseName}.test.ts`)),
        `${caseName} should have a dedicated e2e watch hot-update test entry`,
      ).toBe(true)
    }
  })

  it('keeps every demo hot-update case available in the CI hot-update filter', () => {
    for (const caseName of HOT_UPDATE_CASES_BY_TARGET.demo) {
      expect(
        HOT_UPDATE_CI_CASES,
        `${caseName} should be included in hot-update CI`,
      ).toContain(caseName)
    }
  })

  it('requires demo hot-update cases to verify escaped template/js outputs and generated styles', () => {
    const cases = buildCases(path.resolve(__dirname, '..')).filter(item => item.group === 'demo')

    for (const item of cases) {
      expect(
        item.templateMutation.verifyEscapedIn.length,
        `${item.name} template mutation should verify escaped template output`,
      ).toBeGreaterThan(0)
      expect(
        item.scriptMutation.verifyEscapedIn,
        `${item.name} script mutation should verify escaped js output`,
      ).toContain('js')
      expect(
        item.minGlobalStyleEscapedClasses ?? 1,
        `${item.name} should require generated escaped classes in wxss outputs`,
      ).toBeGreaterThan(0)

      if (item.contentMutation) {
        const contentVerifiedTargets = new Set([
          ...item.contentMutation.verifyEscapedIn,
          ...(item.contentMutation.verifyClassLiteralIn ?? []),
        ])
        expect(
          contentVerifiedTargets.size,
          `${item.name} content mutation should verify at least one escaped output target`,
        ).toBeGreaterThan(0)
      }
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
