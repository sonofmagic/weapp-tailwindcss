import { describe, expect, it } from 'vitest'
import { buildDemoBaseCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/base'
import { buildDemoExtendedCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/extended'

const watchCoveredProjects = new Set([
  ...buildDemoBaseCases('/repo').map(item => item.project),
  ...buildDemoExtendedCases('/repo').map(item => item.project),
])

const automatedWatchCases = [
  ...buildDemoBaseCases('/repo'),
  ...buildDemoExtendedCases('/repo'),
]

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
        expect(watchCase.contentMutation.verifyClassLiteralIn).toContain('js')
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

  it('keeps the automated watch matrix explicit', () => {
    expect([...watchCoveredProjects].sort()).toEqual([...matrixProjects].sort())
  })
})
