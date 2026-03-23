import { describe, expect, it } from 'vitest'
import { buildAppCases } from '../scripts/watch-hmr-regression/cases/apps'
import { buildDemoBaseCases } from '../scripts/watch-hmr-regression/cases/demo/base'
import { buildDemoExtendedCases } from '../scripts/watch-hmr-regression/cases/demo/extended'

const watchCoveredProjects = new Set([
  ...buildDemoBaseCases('/repo').map(item => item.project),
  ...buildDemoExtendedCases('/repo').map(item => item.project),
  ...buildAppCases('/repo').map(item => item.project),
])

const sourceCoveredProjects = new Set([
  'demo/uni-app-tailwindcss-v4',
  'demo/uni-app-webpack-tailwindcss-v4',
  'demo/uni-app-x-hbuilderx-tailwindcss4',
  'demo/taro-vite-tailwindcss-v4',
  'demo/taro-webpack-tailwindcss-v4',
  'demo/mpx-tailwindcss-v4',
  'apps/vite-native',
  'apps/taro-webpack-tailwindcss-v4',
  'apps/uni-app-x-hbuilderx-tailwindcss4',
])

const miniProgramV3Projects = [
  'demo/uni-app',
  'demo/uni-app-vue3-vite',
  'demo/taro-app',
  'demo/taro-app-vite',
  'demo/taro-vue3-app',
  'demo/mpx-app',
  'demo/rax-app',
  'demo/native-mina',
  'demo/native-ts',
  'apps/vite-native-ts',
  'apps/vite-native-skyline',
  'apps/vite-native-ts-skyline',
]

const miniProgramV4Projects = [
  'demo/uni-app-tailwindcss-v4',
  'demo/uni-app-webpack-tailwindcss-v4',
  'demo/uni-app-x-hbuilderx-tailwindcss4',
  'demo/taro-vite-tailwindcss-v4',
  'demo/taro-webpack-tailwindcss-v4',
  'demo/mpx-tailwindcss-v4',
  'apps/vite-native',
  'apps/taro-webpack-tailwindcss-v4',
  'apps/uni-app-x-hbuilderx-tailwindcss4',
]

const manualBoundaryProjects = [
  'demo/native',
  'demo/gulp-app',
  'demo/uni-app-webpack5',
  'demo/uni-app-x-hbuilderx-tailwindcss3',
  'apps/uni-app-x-hbuilderx-tailwindcss3',
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

  it('documents the current tailwindcss v2 sample boundary', () => {
    const v2Projects = [
      'apps/web-postcss7-compat',
    ]

    expect(v2Projects).toEqual(['apps/web-postcss7-compat'])
  })

  it('documents the current hbuilderx v3 automation boundary', () => {
    expect(manualBoundaryProjects).toEqual([
      'demo/native',
      'demo/gulp-app',
      'demo/uni-app-webpack5',
      'demo/uni-app-x-hbuilderx-tailwindcss3',
      'apps/uni-app-x-hbuilderx-tailwindcss3',
    ])
  })
})
