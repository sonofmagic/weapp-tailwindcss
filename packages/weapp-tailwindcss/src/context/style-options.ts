import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import { resolveUniAppXOptions } from '@/uni-app-x/options'

export function resolveStyleOptionsFromContext(
  ctx: InternalUserDefinedOptions,
): Partial<IStyleHandlerOptions> {
  const resolvedUniAppXOptions = resolveUniAppXOptions(ctx.uniAppX)
  const tailwindcssV4GradientFallback = ctx.cssOptions?.tailwindcssV4GradientFallback
    ?? ctx.tailwindcssV4GradientFallback
  const cssOptions = ctx.cssOptions === undefined && tailwindcssV4GradientFallback === undefined
    ? undefined
    : {
        ...(ctx.cssOptions ?? {}),
        tailwindcssV4GradientFallback,
      }

  return {
    cssPreflight: ctx.cssPreflight,
    cssPreflightRange: ctx.cssPreflightRange,
    cssChildCombinatorReplaceValue: ctx.cssChildCombinatorReplaceValue,
    cssSelectorReplacement: ctx.cssSelectorReplacement,
    rem2rpx: ctx.rem2rpx,
    cssOptions,
    cssRemoveProperty: ctx.cssRemoveProperty,
    cssRemoveHoverPseudoClass: ctx.cssRemoveHoverPseudoClass,
    tailwindcssV4GradientFallback,
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
