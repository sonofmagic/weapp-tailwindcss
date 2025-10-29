import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { logger, pc } from '@weapp-tailwindcss/logger'
import { initializeCache } from '@/cache'
import { getDefaultOptions } from '@/defaults'
import { defuOverrideArray } from '@/utils'
import { toCustomAttributesEntities } from './custom-attributes'
import { createHandlersFromContext } from './handlers'
import { applyLoggerLevel } from './logger'
import { createTailwindcssPatcherFromContext } from './tailwindcss'

// 默认保留列表暂为空，后续若有新增默认变量再补充到该数组
const DEFAULT_CSS_CALC_CUSTOM_PROPERTIES: (string | RegExp)[] = []

function includesToken(list: (string | RegExp)[], token: string | RegExp) {
  return list.some((candidate) => {
    if (typeof token === 'string') {
      if (typeof candidate === 'string') {
        return candidate === token
      }
      candidate.lastIndex = 0
      return candidate.test(token)
    }

    if (typeof candidate === 'string') {
      token.lastIndex = 0
      return token.test(candidate)
    }

    return candidate.source === token.source && candidate.flags === token.flags
  })
}

function ensureDefaultsIncluded(
  value: InternalUserDefinedOptions['cssCalc'],
): InternalUserDefinedOptions['cssCalc'] {
  if (value === true) {
    return {
      includeCustomProperties: [...DEFAULT_CSS_CALC_CUSTOM_PROPERTIES],
    }
  }

  if (Array.isArray(value)) {
    if (!DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length) {
      return value
    }

    const missing = DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.filter(token => !includesToken(value, token))
    return missing.length > 0
      ? [...value, ...missing]
      : value
  }

  if (value && typeof value === 'object') {
    const include = value.includeCustomProperties
    if (!Array.isArray(include)) {
      return {
        ...value,
        includeCustomProperties: [...DEFAULT_CSS_CALC_CUSTOM_PROPERTIES],
      }
    }

    if (!DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length) {
      return value
    }

    const missing = DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.filter(token => !includesToken(include, token))

    return missing.length > 0
      ? {
          ...value,
          includeCustomProperties: [...include, ...missing],
        }
      : value
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
    cssCalcOptions = ensureDefaultsIncluded(cssCalcOptions)
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
