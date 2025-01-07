import type {
  ICustomAttributes,
  ICustomAttributesEntities,
  InternalUserDefinedOptions,
  ItemOrItemArray,
  UserDefinedOptions,
} from './types'
import { createCache } from './cache'
import { defaultOptions } from './defaults'
import { createJsHandler } from './js'
import { useMangleStore } from './mangle'
import { createStyleHandler } from './postcss/index'
import { createInjectPreflight } from './postcss/preflight'
import { createTailwindcssPatcher } from './tailwindcss/patcher'
import { defuOverrideArray, isMap } from './utils'
import { createTemplateHandler } from './wxml/utils'

/**
 * 获取用户定义选项的内部表示，并初始化相关的处理程序和补丁。
 * @param opts - 用户定义的选项，可选。
 * @returns 返回一个包含内部用户定义选项的对象，包括样式、JS和模板处理程序，以及Tailwind CSS补丁。
 */
export function getOptions(opts?: UserDefinedOptions): InternalUserDefinedOptions {
  const result = defuOverrideArray<InternalUserDefinedOptions, Partial<InternalUserDefinedOptions>[]>(
    opts as InternalUserDefinedOptions,
    defaultOptions as InternalUserDefinedOptions,
    {},
  )

  result.escapeMap = result.customReplaceDictionary

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
    jsAstTool,
    babelParserOptions,
    postcssOptions,
    cssRemoveHoverPseudoClass,
    escapeMap,
    mangle,
    tailwindcssBasedir,
    appType,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
  } = result

  const cssInjectPreflight = createInjectPreflight(cssPreflight)

  const customAttributesEntities: ICustomAttributesEntities = isMap(customAttributes)
    ? [...(customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries()]
    : Object.entries(customAttributes)

  const { initMangle, mangleContext, setMangleRuntimeSet } = useMangleStore()
  initMangle(mangle)

  const styleHandler = createStyleHandler({
    cssInjectPreflight,
    customRuleCallback,
    cssPreflightRange,
    escapeMap,
    mangleContext,
    cssChildCombinatorReplaceValue,
    injectAdditionalCssVarScope,
    cssSelectorReplacement,
    rem2rpx,
    postcssOptions,
    cssRemoveHoverPseudoClass,
  })

  const jsHandler = createJsHandler({
    escapeMap,
    mangleContext,
    arbitraryValues,
    jsPreserveClass,
    generateMap: true,
    jsAstTool,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
  })

  const templateHandler = createTemplateHandler({
    customAttributesEntities,
    escapeMap,
    mangleContext,
    inlineWxs,
    jsHandler,
    disabledDefaultTemplateHandler,
  })

  result.styleHandler = styleHandler
  result.jsHandler = jsHandler
  result.templateHandler = templateHandler

  const twPatcher = createTailwindcssPatcher(tailwindcssBasedir, appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined, supportCustomLengthUnitsPatch ?? true)
  result.patch = twPatcher.patch
  result.setMangleRuntimeSet = setMangleRuntimeSet
  result.cache = cache === undefined || typeof cache === 'boolean' ? createCache(cache) : cache
  result.twPatcher = twPatcher
  return result
}
