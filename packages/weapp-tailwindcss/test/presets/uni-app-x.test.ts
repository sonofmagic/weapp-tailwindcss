import { afterEach, describe, expect, it } from 'vitest'

import { uniAppX } from '@/presets'
import { setupEnvSandbox } from './helpers'

describe('uni-app-x preset', () => {
  const env = setupEnvSandbox()
  const originalUtsPlatform = process.env.UNI_UTS_PLATFORM
  const originalUniPlatform = process.env.UNI_PLATFORM

  afterEach(() => {
    env.restore()
    if (originalUtsPlatform === undefined) {
      delete process.env.UNI_UTS_PLATFORM
    }
    else {
      process.env.UNI_UTS_PLATFORM = originalUtsPlatform
    }
    if (originalUniPlatform === undefined) {
      delete process.env.UNI_PLATFORM
    }
    else {
      process.env.UNI_PLATFORM = originalUniPlatform
    }
  })

  it('exposes unitsToPx config', () => {
    env.clearBaseEnv()
    process.env.UNI_UTS_PLATFORM = 'app-android'
    const result = uniAppX({
      base: '/Users/foo/uni-app-x',
      unitsToPx: {
        unitPrecision: 4,
      },
    })

    expect(result.unitsToPx).toEqual({
      unitPrecision: 4,
    })
  })
})
