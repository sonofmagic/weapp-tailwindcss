import { describe, expect, it } from 'vitest'
import { evaluateNativeWait } from './react-native/native-wait'

const defaults = {
  now: 0,
  recovered: false,
  recoveryDelay: 180_000,
  reportTimeout: 300_000,
  startedAt: 0,
  startupTimeout: 1_800_000,
}

describe('React Native runtime wait state', () => {
  it('uses separate native startup and runtime report timeouts', () => {
    expect(evaluateNativeWait({ ...defaults, now: 1_200_000 })).toMatchObject({
      phase: 'native build and launch',
      timedOut: false,
    })
    expect(evaluateNativeWait({ ...defaults, now: 1_000_001, runCompletedAt: 700_000 })).toMatchObject({
      phase: 'runtime report',
      timedOut: true,
    })
  })

  it('does not relaunch a runtime after Metro completed its bundle', () => {
    expect(evaluateNativeWait({
      ...defaults,
      bundleCompletedAt: 120_000,
      now: 400_000,
      runCompletedAt: 100_000,
    }).shouldRecover).toBe(false)
  })

  it('recovers once when no Metro bundle was produced', () => {
    expect(evaluateNativeWait({
      ...defaults,
      now: 280_000,
      runCompletedAt: 100_000,
    }).shouldRecover).toBe(true)
    expect(evaluateNativeWait({
      ...defaults,
      now: 280_000,
      recovered: true,
      runCompletedAt: 100_000,
    }).shouldRecover).toBe(false)
  })
})
