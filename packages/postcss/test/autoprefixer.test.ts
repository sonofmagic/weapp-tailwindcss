import { describe, expect, it } from 'vitest'
import { resolveAutoprefixerPlugin, WEAPP_AUTOPREFIXER_BROWSERS } from '@/autoprefixer'

describe('autoprefixer defaults', () => {
  it('uses mini-program focused defaults for the built-in autoprefixer', () => {
    const plugin = resolveAutoprefixerPlugin(undefined) as any

    expect(plugin.options).toMatchObject({
      add: true,
      flexbox: false,
      grid: false,
      remove: true,
      supports: false,
      overrideBrowserslist: WEAPP_AUTOPREFIXER_BROWSERS,
    })
  })

  it('lets user autoprefixer options override mini-program defaults', () => {
    const plugin = resolveAutoprefixerPlugin({
      add: false,
      flexbox: 'no-2009',
      grid: 'autoplace',
      remove: false,
      supports: true,
      overrideBrowserslist: ['iOS >= 12'],
    }) as any

    expect(plugin.options).toMatchObject({
      add: false,
      flexbox: 'no-2009',
      grid: 'autoplace',
      remove: false,
      supports: true,
      overrideBrowserslist: ['iOS >= 12'],
    })
  })

  it('returns no plugin when autoprefixer is disabled', () => {
    expect(resolveAutoprefixerPlugin(false)).toBeUndefined()
  })
})
