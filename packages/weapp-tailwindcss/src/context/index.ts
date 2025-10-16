import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { logger, pc } from '@weapp-tailwindcss/logger'
import { useMangleStore } from '@weapp-tailwindcss/mangle'
import { initializeCache } from '@/cache'
import { getDefaultOptions } from '@/defaults'
import { defuOverrideArray } from '@/utils'
import { toCustomAttributesEntities } from './custom-attributes'
import { createHandlersFromContext } from './handlers'
import { applyLoggerLevel } from './logger'
import { createTailwindcssPatcherFromContext } from './tailwindcss'

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

  const cssCalcOptions = ctx.cssCalc ?? twPatcher.majorVersion === 4

  const customAttributesEntities = toCustomAttributesEntities(ctx.customAttributes)

  const { initMangle, mangleContext, setMangleRuntimeSet } = useMangleStore()
  initMangle(ctx.mangle)

  const { styleHandler, jsHandler, templateHandler } = createHandlersFromContext(
    ctx,
    mangleContext,
    customAttributesEntities,
    cssCalcOptions,
  )

  ctx.styleHandler = styleHandler
  ctx.jsHandler = jsHandler
  ctx.templateHandler = templateHandler

  ctx.setMangleRuntimeSet = setMangleRuntimeSet
  ctx.cache = initializeCache(ctx.cache)
  ctx.twPatcher = twPatcher
  return ctx
}
