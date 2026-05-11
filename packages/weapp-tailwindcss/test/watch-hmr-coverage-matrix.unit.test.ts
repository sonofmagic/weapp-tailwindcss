import { describe, expect, it } from 'vitest'
import { buildAppCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/apps'
import { buildDemoBaseCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/base'
import { buildDemoExtendedCases } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/extended'

const watchCoveredProjects = new Set([
  ...buildDemoBaseCases('/repo').map(item => item.project),
  ...buildDemoExtendedCases('/repo').map(item => item.project),
  ...buildAppCases('/repo').map(item => item.project),
])

const automatedWatchCases = [
  ...buildDemoBaseCases('/repo'),
  ...buildDemoExtendedCases('/repo'),
  ...buildAppCases('/repo'),
]

const sourceCoveredProjects = new Set([
  'demo/uni-app-tailwindcss-v4',
  'demo/uni-app-x-hbuilderx-tailwindcss4',
  'demo/taro-vite-tailwindcss-v4',
  'demo/taro-webpack-tailwindcss-v4',
  'demo/mpx-tailwindcss-v4',
  'apps/vite-native',
  'apps/taro-webpack-tailwindcss-v4',
])

const miniProgramV3Projects = [
  'demo/uni-app-vue3-vite',
  'demo/taro-app',
  'demo/taro-app-vite',
  'demo/taro-vue3-app',
  'demo/mpx-app',
  'demo/gulp-app',
  'demo/native-ts',
  'apps/vite-native-ts',
  'apps/vite-native-skyline',
  'apps/vite-native-ts-skyline',
]

const miniProgramV4Projects = [
  'demo/uni-app-tailwindcss-v4',
  'demo/uni-app-x-hbuilderx-tailwindcss4',
  'demo/taro-vite-tailwindcss-v4',
  'demo/taro-webpack-tailwindcss-v4',
  'demo/mpx-tailwindcss-v4',
  'apps/vite-native',
  'apps/taro-webpack-tailwindcss-v4',
]

const miniProgramV5Projects = [
  'demo/uni-app-tailwindcss-v5',
  'demo/taro-vite-tailwindcss-v5',
  'demo/mpx-tailwindcss-v5',
]

const manualBoundaryProjects = [
  'demo/native',
  'demo/uni-app-x-hbuilderx-tailwindcss3',
]

describe('watch-hmr coverage matrix', () => {
  it('covers currently automated v3 mini-program samples through watch regression cases', () => {
    for (const project of miniProgramV3Projects) {
      expect(
        watchCoveredProjects.has(project),
        `${project} should be covered by watch regression cases`,
      ).toBe(true)
    }
  })

  it('covers v4 mini-program samples through watch cases or source lifecycle tests', () => {
    for (const project of miniProgramV4Projects) {
      expect(
        watchCoveredProjects.has(project) || sourceCoveredProjects.has(project),
        `${project} should be covered by watch cases or source lifecycle tests`,
      ).toBe(true)
    }
  })

  it('covers standalone v5 mini-program demos through watch regression cases', () => {
    for (const project of miniProgramV5Projects) {
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
      expect(watchCase.templateMutation.verifyEscapedIn.length + (watchCase.templateMutation.verifyClassLiteralIn?.length ?? 0)).toBeGreaterThan(0)
      expect(watchCase.scriptMutation.verifyEscapedIn.length + (watchCase.scriptMutation.verifyClassLiteralIn?.length ?? 0)).toBeGreaterThan(0)
      if (watchCase.contentMutation) {
        expect(watchCase.contentMutation.verifyClassLiteralIn).toContain('js')
      }
    }
  })

  it('keeps the mpx script-only added-class regression guarded by global wxss output', () => {
    const mpxCase = automatedWatchCases.find(item => item.project === 'demo/mpx-app')

    expect(mpxCase).toBeDefined()
    expect(mpxCase?.scriptMutation.verifyClassLiteralIn).toContain('js')
    expect(mpxCase?.globalStyleCandidates.some(item => item.includes('utilities*.wxss'))).toBe(true)
    expect(mpxCase?.minGlobalStyleEscapedClasses).toBeGreaterThanOrEqual(1)
  })

  it('documents the current hbuilderx v3 automation boundary', () => {
    expect(manualBoundaryProjects).toEqual([
      'demo/native',
      'demo/uni-app-x-hbuilderx-tailwindcss3',
    ])
  })
})
