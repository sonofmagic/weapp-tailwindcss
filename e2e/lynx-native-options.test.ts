import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseNativeRunArgs } from './lynx/native-options'

describe('native Lynx runner options', () => {
  it('preserves the compatibility-report defaults', () => {
    expect(parseNativeRunArgs(['android'], '/workspace')).toEqual({
      platform: 'android',
      captureOnly: false,
      bundlePath: undefined,
      outputDir: undefined,
      captureDurationSeconds: 15,
    })
  })

  it('resolves an explicit capture bundle and output directory', () => {
    expect(parseNativeRunArgs(['ios', '--capture-only', '--bundle', 'dist/main.lynx.bundle', '--output', '.capture/ios', '--duration', '12'], '/workspace')).toEqual({
      platform: 'ios',
      captureOnly: true,
      bundlePath: path.join('/workspace', 'dist', 'main.lynx.bundle'),
      outputDir: path.join('/workspace', '.capture', 'ios'),
      captureDurationSeconds: 12,
    })
  })

  it('rejects capture-only mode without a bundle', () => {
    expect(() => parseNativeRunArgs(['android', '--capture-only'])).toThrow('--capture-only requires --bundle')
  })
})
