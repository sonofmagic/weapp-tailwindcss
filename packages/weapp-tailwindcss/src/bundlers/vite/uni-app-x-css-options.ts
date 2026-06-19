import type { InternalUserDefinedOptions, IStyleHandlerOptions } from '@/types'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch, shouldUseNativeAppCssBranch } from '@/runtime-branch'
import { isUniAppXEnabled, resolveUniAppXOptions } from '@/uni-app-x/options'
import { resolveUniUtsPlatform } from '@/utils'

export function resolveUniAppXNativeCssHandlerOptions(
  opts: Pick<InternalUserDefinedOptions, 'appType' | 'generator' | 'platform' | 'cssOptions' | 'uniAppX'>,
): Partial<IStyleHandlerOptions> {
  const uniUtsPlatform = resolveUniUtsPlatform()
  const branch = normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
    appType: opts.appType,
    platform: opts.cssOptions?.platform ?? opts.platform,
    uniAppX: resolveUniAppXOptions(opts.uniAppX),
    uniUtsPlatform,
  })
  const runtimeBranch = resolveGeneratorRuntimeBranch(branch, {
    appType: opts.appType,
    platform: opts.cssOptions?.platform ?? opts.platform,
    uniAppX: resolveUniAppXOptions(opts.uniAppX),
    uniUtsPlatform,
  })
  if (
    !shouldUseNativeAppCssBranch(runtimeBranch)
    || !isUniAppXEnabled(opts.uniAppX)
  ) {
    return {}
  }

  return {
    uniAppX: true,
    uniAppXCssTarget: 'uvue',
    uniAppXUnsupported: resolveUniAppXOptions(opts.uniAppX).uvueUnsupported,
  }
}
