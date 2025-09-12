import type { TailwindcssUserConfig } from 'tailwindcss-patch'
import type {
  ICustomAttributes,
  ICustomAttributesEntities,
  InternalUserDefinedOptions,
  ItemOrItemArray,
  UserDefinedOptions,
} from '@/types'
import { logger, pc } from '@weapp-tailwindcss/logger'
import { useMangleStore } from '@weapp-tailwindcss/mangle'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import { initializeCache } from '@/cache'
import { getDefaultOptions } from '@/defaults'
import { createJsHandler } from '@/js'
import { createTailwindcssPatcher } from '@/tailwindcss'
import { defuOverrideArray, isMap } from '@/utils'
import { createTemplateHandler } from '@/wxml'

// https://www.npmjs.com/package/consola
const loggerLevelMap: Record<'info' | 'warn' | 'error' | 'silent', number> = {
  error: 0,
  warn: 1,
  info: 3,
  silent: -999,
}

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
    cssEntries,
    cssCalc,
    px2rpx,
    logLevel,
  } = ctx

  logger.level = loggerLevelMap[logLevel] ?? loggerLevelMap.info

  const twPatcher = createTailwindcssPatcher(
    {
      basedir: tailwindcssBasedir,
      cacheDir: appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined,
      supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
      tailwindcss: defuOverrideArray<TailwindcssUserConfig, TailwindcssUserConfig[]>(
        tailwindcss,
        {
          v4: {
            base: tailwindcssBasedir,
            cssEntries,
          },
        },
      ),
      tailwindcssPatcherOptions,
    },
  )

  logger.success(`当前使用 ${pc.cyanBright('Tailwind CSS')} 版本为: ${pc.underline(pc.bold(pc.green(twPatcher.packageInfo.version)))}`)

  const cssCalcOptions = cssCalc ?? twPatcher.majorVersion === 4

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
    cssCalc: cssCalcOptions,
    px2rpx,
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

  ctx.setMangleRuntimeSet = setMangleRuntimeSet
  ctx.cache = initializeCache(cache)
  ctx.twPatcher = twPatcher
  return ctx
}
