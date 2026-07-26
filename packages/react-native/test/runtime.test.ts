import { createNativeStyleRuntime } from '@/runtime'
import type { NativeStyleManifest } from '@/types'

const manifest: NativeStyleManifest = {
  version: 1,
  classSet: ['text-white', 'dark:bg-black', 'ios:px-4'],
  variables: {},
  warnings: [],
  rules: {
    'text-white': [{ style: { color: '#fff' } }],
    'dark:bg-black': [{ colorScheme: 'dark', style: { backgroundColor: '#000' } }],
    'ios:px-4': [{ platform: 'ios', style: { paddingLeft: 16, paddingRight: 16 } }],
  },
}

describe('native style runtime', () => {
  it('resolves arrays and conditional objects for the requested environment', () => {
    const runtime = createNativeStyleRuntime(manifest)
    expect(runtime.tw(['text-white', { 'dark:bg-black': true }], { colorScheme: 'dark' })).toEqual({ color: '#fff', backgroundColor: '#000' })
    expect(runtime.tw('ios:px-4', { platform: 'android' })).toEqual({})
    expect(runtime.tw('ios:px-4', { platform: 'ios' })).toEqual({ paddingLeft: 16, paddingRight: 16 })
  })

  it('invalidates the bounded cache when the manifest changes', () => {
    const runtime = createNativeStyleRuntime(manifest)
    expect(runtime.tw('text-white')).toEqual({ color: '#fff' })
    runtime.setManifest({ ...manifest, rules: { ...manifest.rules, 'text-white': [{ style: { color: '#000' } }] } })
    expect(runtime.tw('text-white')).toEqual({ color: '#000' })
  })

  it('uses the injected native environment for variant selection', () => {
    const runtime = createNativeStyleRuntime(manifest)
    runtime.setEnvironment({ colorScheme: 'dark', platform: 'ios' })
    expect(runtime.tw(['dark:bg-black', 'ios:px-4'])).toEqual({ backgroundColor: '#000', paddingLeft: 16, paddingRight: 16 })
  })
})
