import {
  parsePerformanceBudgetFailure,
  resolvePerformanceBudgetConfirmation,
} from '../../../../e2e/watch/hot-update/performance-confirmation'

describe('watch performance budget confirmation', () => {
  const pluginFailure = parsePerformanceBudgetFailure(
    'Error: [demo/taro-vite-react-tailwindcss-v4] template:added-class:hot-update weapp-tailwindcss processing exceeded budget: 11488ms > 10000ms',
  )

  it('parses supported performance budget failures', () => {
    expect(pluginFailure).toEqual({
      key: 'demo/taro-vite-react-tailwindcss-v4\0template:added-class:hot-update\0weapp-tailwindcss processing',
      label: 'demo/taro-vite-react-tailwindcss-v4: template:added-class:hot-update weapp-tailwindcss processing',
    })
    expect(parsePerformanceBudgetFailure(
      '[demo] case memory RSS peak exceeded budget: 6000MB > 5632MB',
    )).toBeDefined()
    expect(parsePerformanceBudgetFailure(
      '[demo] vite:transform heap used exceeded budget: 4300MB > 4096MB',
    )).toBeDefined()
    expect(parsePerformanceBudgetFailure('Error: output assertion failed')).toBeUndefined()
  })

  it('retries only the first performance budget failure', () => {
    expect(resolvePerformanceBudgetConfirmation(true, undefined, pluginFailure)).toMatchObject({
      action: 'retry',
    })
    expect(resolvePerformanceBudgetConfirmation(false, undefined, pluginFailure)).toEqual({ action: 'none' })
  })

  it('blocks confirmed and inconclusive follow-up failures', () => {
    expect(resolvePerformanceBudgetConfirmation(true, pluginFailure, pluginFailure)).toMatchObject({
      action: 'confirmed',
    })

    const differentFailure = parsePerformanceBudgetFailure(
      '[demo/taro-vite-react-tailwindcss-v4] script:added-class:hot-update hot update exceeded budget: 61000ms > 60000ms',
    )
    expect(resolvePerformanceBudgetConfirmation(true, pluginFailure, differentFailure)).toMatchObject({
      action: 'inconclusive',
    })
    expect(resolvePerformanceBudgetConfirmation(true, pluginFailure, undefined)).toMatchObject({
      action: 'inconclusive',
    })
  })
})
