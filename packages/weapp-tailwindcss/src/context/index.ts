import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { logger, pc } from '@weapp-tailwindcss/logger'
import { initializeCache } from '@/cache'
import { getDefaultOptions } from '@/defaults'
import { defuOverrideArray } from '@/utils'
import { toCustomAttributesEntities } from './custom-attributes'
import { createHandlersFromContext } from './handlers'
import { applyLoggerLevel } from './logger'
import { createTailwindcssPatcherFromContext } from './tailwindcss'

const DEFAULT_SPACING_VARIABLE = '--spacing'

function matchesSpacingToken(token: string | RegExp) {
  if (typeof token === 'string') {
    return token === DEFAULT_SPACING_VARIABLE
  }

  token.lastIndex = 0
  return token.test(DEFAULT_SPACING_VARIABLE)
}

function ensureSpacingIncluded(
  value: InternalUserDefinedOptions['cssCalc'],
): InternalUserDefinedOptions['cssCalc'] {
  if (value === true) {
    return {
      includeCustomProperties: [DEFAULT_SPACING_VARIABLE],
    }
  }

  if (Array.isArray(value)) {
    return value.some(matchesSpacingToken)
      ? value
      : [...value, DEFAULT_SPACING_VARIABLE]
  }

  if (value && typeof value === 'object') {
    const include = value.includeCustomProperties
    if (!Array.isArray(include) || include.length === 0) {
      return {
        ...value,
        includeCustomProperties: [DEFAULT_SPACING_VARIABLE],
      }
    }

    if (include.some(matchesSpacingToken)) {
      return value
    }

    return {
      ...value,
      includeCustomProperties: [...include, DEFAULT_SPACING_VARIABLE],
    }
  }

  return value
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

  applyLoggerLevel(ctx.logLevel)

  const twPatcher = createTailwindcssPatcherFromContext(ctx)

  if (twPatcher.packageInfo?.version) {
    logger.success(`当前使用 ${pc.cyanBright('Tailwind CSS')} 版本为: ${pc.underline(pc.bold(pc.green(twPatcher.packageInfo.version)))}`)
  }
  else {
    logger.warn(`${pc.cyanBright('Tailwind CSS')} 未安装，已跳过版本检测与补丁应用。`)
  }

  let cssCalcOptions = ctx.cssCalc ?? twPatcher.majorVersion === 4

  if (twPatcher.majorVersion === 4 && cssCalcOptions) {
    cssCalcOptions = ensureSpacingIncluded(cssCalcOptions)
  }

  ctx.cssCalc = cssCalcOptions

  const customAttributesEntities = toCustomAttributesEntities(ctx.customAttributes)

  const { styleHandler, jsHandler, templateHandler } = createHandlersFromContext(
    ctx,
    customAttributesEntities,
    cssCalcOptions,
  )

  ctx.styleHandler = styleHandler
  ctx.jsHandler = jsHandler
  ctx.templateHandler = templateHandler

  ctx.cache = initializeCache(ctx.cache)
  ctx.twPatcher = twPatcher
  return ctx
}
