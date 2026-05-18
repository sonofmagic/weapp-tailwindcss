import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HOT_UPDATE_CASES_BY_TARGET, HOT_UPDATE_COVERED_PROJECTS } from '../../../e2e/e2eMatrix'
import { getFrameworkIdeCases, getFrameworkIdeExemptCases } from '../../../e2e/frameworkSupportMatrix'
import { shouldRequireIdeLivePageVisibility } from '../../../e2e/frameworkIdeClassHotUpdate'
import { frameworkIdeWatchCaseNames } from '../../../e2e/frameworkIdeHotUpdate'
import { buildDemoBaseCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/base'
import { buildDemoExtendedCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/extended'
import { createStyleMutationPayload } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations/shared'
import {
  STYLE_APPLY_UNSUPPORTED_CASES,
  STYLE_FUNCTION_UNSUPPORTED_CASES,
  STYLE_REFERENCE_REQUIRED_CASES,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'

const automatedWatchCases = [
  ...buildDemoBaseCases('/repo'),
  ...buildDemoExtendedCases('/repo'),
]

const watchCoveredProjects = new Set(automatedWatchCases.map(item => item.project))
const watchCoveredCaseNames = new Set(automatedWatchCases.map(item => item.name))
const automatedWatchCasesByName = new Map(automatedWatchCases.map(item => [item.name, item]))
const repoRoot = join(import.meta.dirname, '../../..')
const demoPackageProjects = readdirSync(join(repoRoot, 'demo'), { withFileTypes: true })
  .filter(item => item.isDirectory())
  .map(item => item.name)
  .filter(name => existsSync(join(repoRoot, 'demo', name, 'package.json')))
  .map(name => `demo/${name}`)
  .sort()

function toSlashPath(filePath: string) {
  return filePath.replace(/\\/g, '/')
}

function toRepoPath(filePath: string) {
  return toSlashPath(filePath).replace(/^[A-Z]:(?=\/)/i, '')
}

function expectDemoSourceFile(sourceFile: string, message: string) {
  const normalizedSourceFile = toRepoPath(sourceFile)

  expect(normalizedSourceFile, `${message} should edit demo source files`).toContain('/repo/demo/')
  expect(normalizedSourceFile, `${message} should not edit generated dist files`).not.toContain('/dist/')
}

function expectHasRoundConfig(
  roundConfigs: { name: string }[] | undefined,
  roundName: string,
  message: string,
) {
  expect(
    roundConfigs?.some(item => item.name === roundName),
    message,
  ).toBe(true)
}

describe('watch-hmr coverage matrix', () => {
  it('covers every demo package project through watch regression cases', () => {
    for (const project of demoPackageProjects) {
      expect(
        watchCoveredProjects.has(project),
        `${project} should be covered by watch regression cases`,
      ).toBe(true)
    }
  })

  it('wires every demo watch case into hot-update e2e entries', () => {
    expect([...HOT_UPDATE_CASES_BY_TARGET.demo].sort()).toEqual([...watchCoveredCaseNames].sort())

    for (const watchCase of automatedWatchCases) {
      expect(
        HOT_UPDATE_COVERED_PROJECTS.has(watchCase.name),
        `${watchCase.name} should be included in hot-update e2e coverage`,
      ).toBe(true)
      expect(
        existsSync(join(repoRoot, 'e2e/watch/hot-update/demo', `${watchCase.name}.test.ts`)),
        `${watchCase.name} should have a dedicated e2e watch hot-update test entry`,
      ).toBe(true)
    }
  })

  it('keeps every automated watch case covering developer-facing HMR surfaces', () => {
    expect(automatedWatchCases.length).toBeGreaterThan(0)

    for (const watchCase of automatedWatchCases) {
      expect(watchCase.templateMutation, `${watchCase.project} should cover template class HMR`).toBeDefined()
      expect(watchCase.scriptMutation, `${watchCase.project} should cover script class HMR`).toBeDefined()
      expect(watchCase.styleMutation, `${watchCase.project} should cover style @apply HMR`).toBeDefined()
      expect(watchCase.subPackageMutations?.map(item => item.root).sort(), `${watchCase.project} should cover normal and independent subpackage HMR`).toEqual(['sub-independent', 'sub-normal'])
      expect(watchCase.templateMutation.verifyEscapedIn.length + (watchCase.templateMutation.verifyClassLiteralIn?.length ?? 0)).toBeGreaterThan(0)
      expect(watchCase.scriptMutation.verifyEscapedIn.length + (watchCase.scriptMutation.verifyClassLiteralIn?.length ?? 0)).toBeGreaterThan(0)
      for (const subPackageMutation of watchCase.subPackageMutations ?? []) {
        expect(subPackageMutation.outputWxml).toContain(subPackageMutation.root)
        expect(subPackageMutation.outputJs).toContain(subPackageMutation.root)
        expect(subPackageMutation.templateMutation.sourceFile).toContain(subPackageMutation.root)
        expect(subPackageMutation.styleMutation.sourceFile).toContain(subPackageMutation.root)
        expect(subPackageMutation.templateMutation.roundConfigs?.length).toBeGreaterThanOrEqual(3)
        expect(subPackageMutation.templateMutation.verifyEscapedIn.length + (subPackageMutation.templateMutation.verifyClassLiteralIn?.length ?? 0)).toBeGreaterThan(0)
      }
      if (watchCase.contentMutation) {
        const expectedCarrier = watchCase.contentMutation.sourceFile.endsWith('.wxml') ? 'wxml' : 'js'
        expect(watchCase.contentMutation.verifyClassLiteralIn).toContain(expectedCarrier)
      }
    }
  })

  it('keeps IDE hot-update cases backed by complex development-time watch scenarios', () => {
    for (const entry of getFrameworkIdeCases()) {
      const watchCaseName = frameworkIdeWatchCaseNames[entry.name]
      expect(watchCaseName, `${entry.name} should map to a watch-HMR case`).toBeDefined()

      const watchCase = automatedWatchCasesByName.get(watchCaseName!)
      expect(watchCase, `${entry.name} should reuse an automated watch-HMR case`).toBeDefined()
      expect(watchCase?.project, `${entry.name} should run against the same demo project as e2e:ide`).toBe(`demo/${entry.name}`)
      expect(watchCase?.templateMutation, `${entry.name} should cover template edits in IDE`).toBeDefined()
      expect(watchCase?.scriptMutation, `${entry.name} should cover script edits in IDE`).toBeDefined()
      expect(watchCase?.globalStyleCandidates.length, `${entry.name} should verify global CSS output for IDE class changes`).toBeGreaterThan(0)

      expectHasRoundConfig(
        watchCase?.templateMutation.roundConfigs,
        'complex-corpus',
        `${entry.name} template IDE HMR should include complex arbitrary variants`,
      )
      expectHasRoundConfig(
        watchCase?.scriptMutation.roundConfigs,
        'complex-corpus',
        `${entry.name} script IDE HMR should include complex arbitrary variants`,
      )
    }
  })

  it('keeps Tailwind CSS v4 IDE demos on the standard tailwindcss import surface', () => {
    for (const entry of getFrameworkIdeCases()) {
      if (entry.tailwindcss !== 'v4') {
        continue
      }

      const watchCaseName = frameworkIdeWatchCaseNames[entry.name]
      const watchCase = automatedWatchCasesByName.get(watchCaseName!)
      expect(watchCase, `${entry.name} should map to an automated watch case`).toBeDefined()

      const styleSources = [
        watchCase?.styleMutation.sourceFile,
        ...watchCase?.subPackageMutations?.map(item => item.styleMutation.sourceFile) ?? [],
      ].filter((item): item is string => Boolean(item))

      for (const sourceFile of styleSources) {
        const realSourceFile = toRepoPath(sourceFile).replace('/repo/', `${toSlashPath(repoRoot)}/`)
        expect(existsSync(realSourceFile), `${entry.name} style source should exist: ${realSourceFile}`).toBe(true)
        const source = readFileSync(realSourceFile, 'utf8')

        if (source.includes('@import')) {
          expect(source, `${entry.name} should use @import "tailwindcss" in ${realSourceFile}`).toContain('@import "tailwindcss"')
          expect(source, `${entry.name} should not expose @import "weapp-tailwindcss" in ${realSourceFile}`).not.toContain('@import "weapp-tailwindcss"')
        }
      }
    }
  })

  it('keeps Tailwind CSS v4 IDE style HMR aligned with @reference requirements', () => {
    for (const entry of getFrameworkIdeCases()) {
      if (entry.tailwindcss !== 'v4') {
        continue
      }

      const watchCaseName = frameworkIdeWatchCaseNames[entry.name]
      const watchCase = automatedWatchCasesByName.get(watchCaseName!)
      expect(watchCase, `${entry.name} should map to an automated watch case`).toBeDefined()

      const payload = createStyleMutationPayload(watchCase!)
      expect(payload.referenceDirective, `${entry.name} should inject Tailwind v4 @reference during style HMR`).toBe('@reference "tailwindcss";')
    }
  })

  it('keeps IDE page-visibility relaxations explicit and narrow', () => {
    const originalRequireLivePageVisibility = process.env.E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY
    process.env.E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY = '1'
    try {
      const relaxedCases = getFrameworkIdeCases()
        .filter(entry => !shouldRequireIdeLivePageVisibility({ name: frameworkIdeWatchCaseNames[entry.name] }))
        .map(entry => entry.name)

      expect(relaxedCases).toEqual(['taro-webpack-react-tailwindcss-v4'])
    }
    finally {
      if (originalRequireLivePageVisibility == null) {
        delete process.env.E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY
      }
      else {
        process.env.E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY = originalRequireLivePageVisibility
      }
    }
  })

  it('keeps Taro Vue3 IDE exemptions paired with full watch-HMR coverage', () => {
    for (const entry of getFrameworkIdeExemptCases()) {
      expect(entry.framework, `${entry.name} should be an explicit Taro Vue3 IDE exemption`).toBe('taro-vue3')
      expect(entry.ide.reason, `${entry.name} should document the Vue3 probe gap`).toContain('Vue3 Taro demo')

      const watchCase = automatedWatchCasesByName.get(entry.name)
      expect(watchCase, `${entry.name} should still be covered by watch-HMR`).toBeDefined()
      expectHasRoundConfig(
        watchCase?.templateMutation.roundConfigs,
        'complex-corpus',
        `${entry.name} template watch-HMR should include complex arbitrary variants`,
      )
      expectHasRoundConfig(
        watchCase?.scriptMutation.roundConfigs,
        'complex-corpus',
        `${entry.name} script watch-HMR should include complex arbitrary variants`,
      )
    }
  })

  it('models normal user edits for every demo case', () => {
    for (const watchCase of automatedWatchCases) {
      const mutationConfigs = [
        watchCase.templateMutation,
        watchCase.scriptMutation,
        watchCase.styleMutation,
        ...watchCase.subPackageMutations?.flatMap(item => [
          item.templateMutation,
          item.styleMutation,
        ]) ?? [],
      ]

      for (const mutationConfig of mutationConfigs) {
        expectDemoSourceFile(mutationConfig.sourceFile, watchCase.project)
      }

      if (watchCase.contentMutation) {
        const expectedCarrier = watchCase.contentMutation.sourceFile.endsWith('.wxml') ? 'wxml' : 'js'
        expectDemoSourceFile(watchCase.contentMutation.sourceFile, `${watchCase.project} content mutation`)
        expect(watchCase.contentMutation.verifyClassLiteralIn, `${watchCase.project} content mutation should verify source-visible literals`).toContain(expectedCarrier)
      }
    }
  })

  it('keeps demo source boundary checks portable on Windows paths', () => {
    expectDemoSourceFile('D:\\repo\\demo\\gulp-tailwindcss-v3\\src\\pages\\index\\index.wxml', 'windows demo path')

    expect(() => {
      expectDemoSourceFile('D:\\repo\\demo\\gulp-tailwindcss-v3\\dist\\pages\\index\\index.wxml', 'windows dist path')
    }).toThrow()
  })

  it('keeps style @apply and Tailwind function validation policy explicit', () => {
    for (const watchCase of automatedWatchCases) {
      const payload = createStyleMutationPayload(watchCase)

      if (STYLE_APPLY_UNSUPPORTED_CASES.has(watchCase.name)) {
        expect(payload.applyUtilities, `${watchCase.name} should skip unsupported @apply validation`).toEqual([])
        expect(payload.expectedApplyDeclarations, `${watchCase.name} should skip unsupported @apply declarations`).toEqual([])
      }
      else {
        expect(payload.applyUtilities.length, `${watchCase.name} should validate @apply utilities`).toBeGreaterThan(0)
        expect(payload.expectedApplyDeclarations.length, `${watchCase.name} should validate expanded @apply declarations`).toBeGreaterThan(0)
      }

      if (STYLE_FUNCTION_UNSUPPORTED_CASES.has(watchCase.name)) {
        expect(payload.functionNeedle, `${watchCase.name} should skip unsupported Tailwind function validation`).toBeUndefined()
        expect(payload.functionDeclarations, `${watchCase.name} should not inject unsupported Tailwind functions`).toEqual([])
        expect(payload.expectedFunctionDeclarations, `${watchCase.name} should not expect unsupported Tailwind function declarations`).toEqual([])
        expect(payload.forbiddenFunctionFragments, `${watchCase.name} should not assert unsupported Tailwind function fragments`).toEqual([])
      }
      else {
        expect(payload.functionNeedle, `${watchCase.name} should validate Tailwind function HMR`).toContain('.tw-watch-style-')
        expect(payload.functionDeclarations.length, `${watchCase.name} should inject Tailwind function declarations`).toBeGreaterThan(0)
        expect(payload.expectedFunctionDeclarations.length, `${watchCase.name} should validate resolved Tailwind function declarations`).toBeGreaterThan(0)
        expect(payload.forbiddenFunctionFragments, `${watchCase.name} should forbid unresolved Tailwind functions`).toContain('theme(')
      }

      if (STYLE_REFERENCE_REQUIRED_CASES.has(watchCase.name)) {
        expect(payload.referenceDirective, `${watchCase.name} should include Tailwind v4 @reference`).toBe('@reference "tailwindcss";')
      }
      else {
        expect(payload.referenceDirective, `${watchCase.name} should not need Tailwind v4 @reference`).toBeUndefined()
      }
    }
  })

  it('keeps the mpx script-only added-class regression guarded by global wxss output', () => {
    const mpxCase = automatedWatchCases.find(item => item.project === 'demo/mpx-tailwindcss-v3')

    expect(mpxCase).toBeDefined()
    expect(mpxCase?.scriptMutation.verifyClassLiteralIn).toContain('js')
    expect(mpxCase?.globalStyleCandidates.some(item => item.includes('utilities*.wxss'))).toBe(true)
    expect(mpxCase?.minGlobalStyleEscapedClasses).toBeGreaterThanOrEqual(1)
  })

  it('keeps Taro Webpack Vue3 v4 style HMR wired through the page css import', () => {
    const watchCase = automatedWatchCases.find(item => item.project === 'demo/taro-webpack-vue3-tailwindcss-v4')

    expect(watchCase).toBeDefined()
    expect(toRepoPath(watchCase?.styleMutation?.sourceFile ?? '')).toBe('/repo/demo/taro-webpack-vue3-tailwindcss-v4/src/pages/index/index.css')
    expect(watchCase?.outputStyleCandidates.map(toRepoPath)).toContain('/repo/demo/taro-webpack-vue3-tailwindcss-v4/dist/app.wxss')
  })

  it('keeps the automated watch matrix explicit', () => {
    expect([...watchCoveredProjects].sort()).toEqual(demoPackageProjects)
  })
})
