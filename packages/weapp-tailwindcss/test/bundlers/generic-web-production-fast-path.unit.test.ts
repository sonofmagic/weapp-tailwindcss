import { describe, expect, it } from 'vitest'
import { shouldUseGenericWebProductionFastPath } from '@/bundlers/vite/shared/generic-web-production-fast-path'

describe('generic Web production fast path', () => {
  const productionWeb = {
    command: 'build' as const,
    frameworkName: 'generic',
    hasProcessedCss: true,
    isWebGeneratorTarget: true,
    watch: undefined,
  }

  it('only enables the fast path for Generic Web production builds with generated CSS', () => {
    expect(shouldUseGenericWebProductionFastPath(productionWeb)).toBe(true)
  })

  it.each([
    ['Vite dev', { command: 'serve' as const }],
    ['Vite watch build', { watch: {} }],
    ['missing generated CSS', { hasProcessedCss: false }],
    ['mini-program target', { isWebGeneratorTarget: false }],
    ['uni-app', { frameworkName: 'uni-app' }],
    ['uni-app x', { frameworkName: 'uni-app-x' }],
    ['Taro', { frameworkName: 'taro' }],
    ['weapp-vite', { frameworkName: 'weapp-vite' }],
  ])('keeps the full pipeline for %s', (_label, overrides) => {
    expect(shouldUseGenericWebProductionFastPath({
      ...productionWeb,
      ...overrides,
    })).toBe(false)
  })
})
