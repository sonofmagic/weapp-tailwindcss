import type autoprefixer from 'autoprefixer'
import type { AcceptedPlugin } from 'postcss'
import autoprefixerPlugin from 'autoprefixer'

export type AutoprefixerOptions = autoprefixer.Options

export type WeappAutoprefixerOptions = boolean | AutoprefixerOptions

export const WEAPP_AUTOPREFIXER_BROWSERS = [
  'iOS >= 8',
  'Android >= 4.4',
  'ChromeAndroid >= 37',
]

const WEAPP_AUTOPREFIXER_DEFAULT_OPTIONS: AutoprefixerOptions = {
  flexbox: false,
}

const AUTOPREFIXER_PLUGIN_NAME = 'autoprefixer'

export function isAutoprefixerPlugin(plugin: AcceptedPlugin): boolean {
  return (plugin as { postcssPlugin?: string } | undefined)?.postcssPlugin === AUTOPREFIXER_PLUGIN_NAME
}

export function resolveAutoprefixerPlugin(
  option: WeappAutoprefixerOptions | undefined,
): AcceptedPlugin | undefined {
  if (option === false) {
    return undefined
  }

  const userOptions = option === true || option === undefined ? {} : option
  return autoprefixerPlugin({
    ...WEAPP_AUTOPREFIXER_DEFAULT_OPTIONS,
    ...userOptions,
    overrideBrowserslist: userOptions.overrideBrowserslist ?? WEAPP_AUTOPREFIXER_BROWSERS,
  })
}
