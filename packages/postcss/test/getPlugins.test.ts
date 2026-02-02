import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import { describe, expect, it } from 'vitest'
import { getPlugins } from '@/plugins'

function createOptions(partial: Partial<IStyleHandlerOptions>): IStyleHandlerOptions {
  return {
    cssPresetEnv: {
      features: {},
      autoprefixer: { add: false },
    },
    ...partial,
  } as IStyleHandlerOptions
}

function pluginNames(plugins: AcceptedPlugin[]) {
  return plugins
    .map(plugin => (plugin as { postcssPlugin?: string }).postcssPlugin)
    .filter(Boolean)
}

describe('getPlugins', () => {
  it('injects optional plugins when features enabled', () => {
    const options = createOptions({
      px2rpx: true,
      rem2rpx: true,
      unitsToPx: true,
      cssCalc: {
        includeCustomProperties: [/^--tw-/],
      },
    })

    const plugins = getPlugins(options)
    expect(options.ctx).toBeDefined()
    expect(pluginNames(plugins)).toEqual(expect.arrayContaining([
      'postcss-weapp-tailwindcss-rename-plugin',
      'postcss-preset-env',
      'postcss-units-to-px',
      'postcss-pxtrans',
      'postcss-rem-to-responsive-pixel',
      'postcss-calc',
      'postcss-remove-include-custom-properties',
    ]))
  })

  it('preserves user provided plugins and skips optional ones when disabled', () => {
    const userPlugin = { postcssPlugin: 'user-plugin' }
    const options = createOptions({
      px2rpx: false,
      rem2rpx: false,
      unitsToPx: false,
      cssCalc: false,
      postcssOptions: {
        plugins: [userPlugin],
      },
    })

    const plugins = getPlugins(options)
    expect(plugins[0]).toBe(userPlugin)
    const names = pluginNames(plugins)
    expect(names).not.toContain('postcss-pxtrans')
    expect(names).not.toContain('postcss-rem-to-responsive-pixel')
    expect(names).not.toContain('postcss-units-to-px')
    expect(names).not.toContain('postcss-calc')
    expect(names).not.toContain('postcss-remove-include-custom-properties')
  })
})
