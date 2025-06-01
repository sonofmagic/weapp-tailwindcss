import type {
  ICustomAttributes,
  ICustomAttributesEntities,
  InternalUserDefinedOptions,
  ItemOrItemArray,
  UserDefinedOptions,
} from '@/types'
import { useMangleStore } from '@weapp-tailwindcss/mangle'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import { initializeCache } from '@/cache'
import { getDefaultOptions } from '@/defaults'
import { createJsHandler } from '@/js'
import { createTailwindcssPatcher } from '@/tailwindcss'
import { defuOverrideArray, isMap } from '@/utils'
import { createTemplateHandler } from '@/wxml'

/**
 * 获取用户定义选项的内部表示，并初始化相关的处理程序和补丁。
 * @param opts - 用户定义的选项，可选。
 * @returns 返回一个包含内部用户定义选项的对象，包括样式、JS和模板处理程序，以及Tailwind CSS补丁。
 */
export function getCompilerContext(opts?: UserDefinedOptions): InternalUserDefinedOptions {
  const ctx = defuOverrideArray<InternalUserDefinedOptions, Partial<InternalUserDefinedOptions>[]>(
    opts as InternalUserDefinedOptions,
    getDefaultOptions() as InternalUserDefinedOptions,
    {},
  )

  ctx.escapeMap = ctx.customReplaceDictionary

  const {
    cssPreflight,
    customRuleCallback,
    cssPreflightRange,
    customAttributes,
    supportCustomLengthUnitsPatch,
    arbitraryValues,
    cssChildCombinatorReplaceValue,
    inlineWxs,
    injectAdditionalCssVarScope,
    jsPreserveClass,
    disabledDefaultTemplateHandler,
    cssSelectorReplacement,
    rem2rpx,
    cache,
    babelParserOptions,
    postcssOptions,
    cssRemoveProperty,
    cssRemoveHoverPseudoClass,
    escapeMap,
    mangle,
    tailwindcssBasedir,
    appType,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    cssPresetEnv,
    tailwindcss,
    tailwindcssPatcherOptions,
    uniAppX,
  } = ctx

  const customAttributesEntities: ICustomAttributesEntities = isMap(customAttributes)
    ? [...(customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries()]
    : Object.entries(customAttributes)

  const { initMangle, mangleContext, setMangleRuntimeSet } = useMangleStore()
  initMangle(mangle)

  const styleHandler = createStyleHandler({
    cssPreflight,
    customRuleCallback,
    cssPreflightRange,
    escapeMap,
    mangleContext,
    cssChildCombinatorReplaceValue,
    injectAdditionalCssVarScope,
    cssSelectorReplacement,
    rem2rpx,
    postcssOptions,
    cssRemoveProperty,
    cssRemoveHoverPseudoClass,
    cssPresetEnv,
    uniAppX,
  })

  const jsHandler = createJsHandler({
    escapeMap,
    mangleContext,
    arbitraryValues,
    jsPreserveClass,
    generateMap: true,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    uniAppX,
  })

  const templateHandler = createTemplateHandler({
    customAttributesEntities,
    escapeMap,
    mangleContext,
    inlineWxs,
    jsHandler,
    disabledDefaultTemplateHandler,
  })

  ctx.styleHandler = styleHandler
  ctx.jsHandler = jsHandler
  ctx.templateHandler = templateHandler

  const twPatcher = createTailwindcssPatcher(
    {
      basedir: tailwindcssBasedir,
      cacheDir: appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined,
      supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
      tailwindcss,
      tailwindcssPatcherOptions,
    },
  )
  ctx.setMangleRuntimeSet = setMangleRuntimeSet
  ctx.cache = initializeCache(cache)
  ctx.twPatcher = twPatcher
  return ctx
}
