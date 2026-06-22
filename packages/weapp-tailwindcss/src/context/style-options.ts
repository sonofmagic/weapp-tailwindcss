import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch } from '@/runtime-branch'
import { resolveUniAppXOptions } from '@/uni-app-x/options'

export type ResolvedStyleOptions = Partial<IStyleHandlerOptions> & {
  appType?: InternalUserDefinedOptions['appType'] | undefined
}

export function resolveStyleOptionsFromContext(
  ctx: InternalUserDefinedOptions,
  tailwindcssMajorVersion?: number,
): ResolvedStyleOptions {
  const resolvedUniAppXOptions = resolveUniAppXOptions(ctx.uniAppX)
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(ctx.generator, {
    appType: ctx.appType,
    platform: ctx.cssOptions?.platform ?? ctx.platform,
    tailwindcssMajorVersion,
    uniAppX: resolvedUniAppXOptions,
  })
  const branch = resolveGeneratorRuntimeBranch(generatorOptions, {
    appType: ctx.appType,
    platform: ctx.cssOptions?.platform ?? ctx.platform,
    tailwindcssMajorVersion,
    uniAppX: resolvedUniAppXOptions,
  })
  const hasCssOptions = ctx.cssOptions !== undefined
  const cssOptions = {
    cssPreflight: ctx.cssOptions?.cssPreflight ?? ctx.cssPreflight,
    cssPreflightRange: ctx.cssOptions?.cssPreflightRange ?? ctx.cssPreflightRange,
    cssChildCombinatorReplaceValue: ctx.cssOptions?.cssChildCombinatorReplaceValue ?? ctx.cssChildCombinatorReplaceValue,
    cssSelectorReplacement: ctx.cssOptions?.cssSelectorReplacement ?? ctx.cssSelectorReplacement,
    rem2rpx: ctx.cssOptions?.rem2rpx ?? ctx.rem2rpx,
    cssRemoveProperty: ctx.cssOptions?.cssRemoveProperty ?? ctx.cssRemoveProperty,
    cssRemoveHoverPseudoClass: ctx.cssOptions?.cssRemoveHoverPseudoClass ?? ctx.cssRemoveHoverPseudoClass,
    tailwindcssV4GradientFallback: ctx.cssOptions?.tailwindcssV4GradientFallback ?? ctx.tailwindcssV4GradientFallback,
    cssPresetEnv: ctx.cssOptions?.cssPresetEnv ?? ctx.cssPresetEnv,
    atRules: ctx.cssOptions?.atRules ?? ctx.atRules,
    autoprefixer: ctx.cssOptions?.autoprefixer ?? ctx.autoprefixer,
    cssCalc: ctx.cssOptions?.cssCalc ?? ctx.cssCalc,
    platform: branch.platform ?? ctx.cssOptions?.platform ?? ctx.platform,
    px2rpx: ctx.cssOptions?.px2rpx ?? ctx.px2rpx,
    unitsToPx: ctx.cssOptions?.unitsToPx ?? ctx.unitsToPx,
    unitConversion: ctx.cssOptions?.unitConversion ?? ctx.unitConversion,
    injectAdditionalCssVarScope: ctx.cssOptions?.injectAdditionalCssVarScope ?? ctx.injectAdditionalCssVarScope,
  } satisfies NonNullable<IStyleHandlerOptions['cssOptions']>

  return {
    appType: ctx.appType,
    cssPreflight: cssOptions.cssPreflight,
    cssPreflightRange: cssOptions.cssPreflightRange,
    cssChildCombinatorReplaceValue: cssOptions.cssChildCombinatorReplaceValue,
    cssSelectorReplacement: cssOptions.cssSelectorReplacement,
    rem2rpx: cssOptions.rem2rpx,
    ...(hasCssOptions ? { cssOptions } : {}),
    cssRemoveProperty: cssOptions.cssRemoveProperty,
    cssRemoveHoverPseudoClass: cssOptions.cssRemoveHoverPseudoClass,
    tailwindcssV4GradientFallback: cssOptions.tailwindcssV4GradientFallback,
    cssPresetEnv: cssOptions.cssPresetEnv,
    atRules: cssOptions.atRules,
    autoprefixer: cssOptions.autoprefixer,
    cssCalc: cssOptions.cssCalc,
    uniAppX: branch.isNativeApp,
    platform: cssOptions.platform,
    px2rpx: cssOptions.px2rpx,
    unitsToPx: cssOptions.unitsToPx,
    unitConversion: cssOptions.unitConversion,
  }
}
