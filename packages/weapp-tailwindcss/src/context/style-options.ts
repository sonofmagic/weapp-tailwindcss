import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import { resolveUniAppXOptions } from '@/uni-app-x/options'

export function resolveStyleOptionsFromContext(
  ctx: InternalUserDefinedOptions,
): Partial<IStyleHandlerOptions> {
  const resolvedUniAppXOptions = resolveUniAppXOptions(ctx.uniAppX)

  return {
    cssPreflight: ctx.cssPreflight,
    cssPreflightRange: ctx.cssPreflightRange,
    cssChildCombinatorReplaceValue: ctx.cssChildCombinatorReplaceValue,
    cssSelectorReplacement: ctx.cssSelectorReplacement,
    rem2rpx: ctx.rem2rpx,
    cssRemoveProperty: ctx.cssRemoveProperty,
    cssRemoveHoverPseudoClass: ctx.cssRemoveHoverPseudoClass,
    tailwindcssV4GradientFallback: ctx.tailwindcssV4GradientFallback,
    cssPresetEnv: ctx.cssPresetEnv,
    autoprefixer: ctx.autoprefixer,
    cssCalc: ctx.cssCalc,
    uniAppX: resolvedUniAppXOptions.enabled,
    platform: ctx.platform,
    px2rpx: ctx.px2rpx,
    unitsToPx: ctx.unitsToPx,
    unitConversion: ctx.unitConversion,
  }
}
