import type { InternalUserDefinedOptions, IStyleHandlerOptions } from '@/types'
import { isUniAppXEnabled, resolveUniAppXOptions } from '@/uni-app-x/options'
import { resolveUniUtsPlatform } from '@/utils'

export function resolveUniAppXNativeCssHandlerOptions(
  opts: Pick<InternalUserDefinedOptions, 'appType' | 'uniAppX'>,
): Partial<IStyleHandlerOptions> {
  if (
    opts.appType !== 'uni-app-x'
    || !isUniAppXEnabled(opts.uniAppX)
    || !resolveUniUtsPlatform().isApp
  ) {
    return {}
  }

  return {
    uniAppX: true,
    uniAppXCssTarget: 'uvue',
    uniAppXUnsupported: resolveUniAppXOptions(opts.uniAppX).uvueUnsupported,
  }
}
