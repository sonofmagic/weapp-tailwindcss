import { describe, expect, it } from 'vitest'
import { buildDemoBaseCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/base'
import { buildDemoExtendedCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/extended'
import { createStyleMutationPayload } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations/shared'

const watchCoveredProjects = new Set([
  ...buildDemoBaseCases('/repo').map(item => item.project),
  ...buildDemoExtendedCases('/repo').map(item => item.project),
])

const automatedWatchCases = [
  ...buildDemoBaseCases('/repo'),
  ...buildDemoExtendedCases('/repo'),
]

const styleApplyUnsupportedCases = new Set([
  'mpx-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
])

const styleFunctionUnsupportedCases = new Set([
  'mpx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
])

const styleReferenceRequiredCases = new Set([
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])

const matrixProjects = [
  'demo/gulp-tailwindcss-v3',
  'demo/gulp-tailwindcss-v4',
  'demo/mpx-tailwindcss-v3',
  'demo/mpx-tailwindcss-v4',
  'demo/taro-webpack-react-tailwindcss-v3',
  'demo/taro-webpack-react-tailwindcss-v4',
  'demo/taro-webpack-vue3-tailwindcss-v3',
  'demo/taro-webpack-vue3-tailwindcss-v4',
  'demo/taro-vite-react-tailwindcss-v3',
  'demo/taro-vite-react-tailwindcss-v4',
  'demo/taro-vite-vue3-tailwindcss-v3',
  'demo/taro-vite-vue3-tailwindcss-v4',
  'demo/uni-app-vite-tailwindcss-v3',
  'demo/uni-app-vite-tailwindcss-v4',
  'demo/weapp-vite-tailwindcss-v3',
  'demo/weapp-vite-tailwindcss-v4',
]

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

describe('watch-hmr coverage matrix', () => {
  it('covers every retained demo matrix project through watch regression cases', () => {
    for (const project of matrixProjects) {
      expect(
        watchCoveredProjects.has(project),
        `${project} should be covered by watch regression cases`,
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

      if (styleApplyUnsupportedCases.has(watchCase.name)) {
        expect(payload.applyUtilities, `${watchCase.name} should skip unsupported @apply validation`).toEqual([])
        expect(payload.expectedApplyDeclarations, `${watchCase.name} should skip unsupported @apply declarations`).toEqual([])
      }
      else {
        expect(payload.applyUtilities.length, `${watchCase.name} should validate @apply utilities`).toBeGreaterThan(0)
        expect(payload.expectedApplyDeclarations.length, `${watchCase.name} should validate expanded @apply declarations`).toBeGreaterThan(0)
      }

      if (styleFunctionUnsupportedCases.has(watchCase.name)) {
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

      if (styleReferenceRequiredCases.has(watchCase.name)) {
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
    expect([...watchCoveredProjects].sort()).toEqual([...matrixProjects].sort())
  })
})
