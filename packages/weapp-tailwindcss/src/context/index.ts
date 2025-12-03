import type { InternalUserDefinedOptions, RefreshTailwindcssPatcherOptions, TailwindcssPatcherLike, UserDefinedOptions } from '@/types'
import { rm } from 'node:fs/promises'
import { logger, pc } from '@weapp-tailwindcss/logger'
import { initializeCache } from '@/cache'
import { getDefaultOptions } from '@/defaults'
import { invalidateRuntimeClassSet, refreshTailwindcssPatcherSymbol } from '@/tailwindcss/runtime'
import { logTailwindcssTarget } from '@/tailwindcss/targets'
import { applyV4CssCalcDefaults, warnMissingCssEntries } from '@/tailwindcss/v4'
import { defuOverrideArray } from '@/utils'
import { withCompilerContextCache } from './compiler-context-cache'
import { toCustomAttributesEntities } from './custom-attributes'
import { createHandlersFromContext } from './handlers'
import { applyLoggerLevel } from './logger'
import { createTailwindcssPatcherFromContext } from './tailwindcss'

interface ClearTailwindcssPatcherCacheOptions {
  removeDirectory?: boolean
}

export async function clearTailwindcssPatcherCache(
  patcher: TailwindcssPatcherLike | undefined,
  options?: ClearTailwindcssPatcherCacheOptions,
) {
  if (!patcher) {
    return
  }
  const cacheOptions = patcher.options?.cache
  if (
    cacheOptions == null
    || (typeof cacheOptions === 'object' && cacheOptions.enabled === false)
  ) {
    return
  }
  const cachePaths = new Map<string, boolean>()
  const normalizedCacheOptions = typeof cacheOptions === 'object' ? cacheOptions : undefined
  if (normalizedCacheOptions?.path) {
    cachePaths.set(normalizedCacheOptions.path, false)
  }
  // 以非侵入方式访问私有的缓存目录路径，避免依赖 TailwindcssPatcher 内部类型。
  const privateCachePath: string | undefined = (patcher as any)?.cacheStore?.options?.path
  if (privateCachePath) {
    cachePaths.set(privateCachePath, false)
  }
  if (options?.removeDirectory && normalizedCacheOptions?.dir) {
    cachePaths.set(normalizedCacheOptions.dir, true)
  }
  if (!cachePaths.size) {
    return
  }
  for (const [cachePath, recursive] of cachePaths.entries()) {
    try {
      await rm(cachePath, { force: true, recursive })
    }
    catch (error) {
      const err = error as NodeJS.ErrnoException
      if (err?.code === 'ENOENT') {
        continue
      }
      logger.debug('failed to clear tailwindcss patcher cache: %s %O', cachePath, err)
    }
  }
}

function createInternalCompilerContext(opts?: UserDefinedOptions): InternalUserDefinedOptions {
  const ctx = defuOverrideArray<InternalUserDefinedOptions, Partial<InternalUserDefinedOptions>[]>(
    opts as InternalUserDefinedOptions,
    getDefaultOptions() as InternalUserDefinedOptions,
    {},
  )

  ctx.escapeMap = ctx.customReplaceDictionary

  applyLoggerLevel(ctx.logLevel)

  const twPatcher = createTailwindcssPatcherFromContext(ctx)
  logTailwindcssTarget('runtime', twPatcher, ctx.tailwindcssBasedir)

  if (twPatcher.packageInfo?.version) {
    logger.success(`当前使用 ${pc.cyanBright('Tailwind CSS')} 版本为: ${pc.underline(pc.bold(pc.green(twPatcher.packageInfo.version)))}`)
  }
  else {
    logger.warn(`${pc.cyanBright('Tailwind CSS')} 未安装，已跳过版本检测与补丁应用。`)
  }

  warnMissingCssEntries(ctx, twPatcher)

  const cssCalcOptions = applyV4CssCalcDefaults(ctx.cssCalc, twPatcher)
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
  const refreshTailwindcssPatcher = async (
    options?: RefreshTailwindcssPatcherOptions,
  ): Promise<TailwindcssPatcherLike> => {
    const previousPatcher = ctx.twPatcher
    if (options?.clearCache !== false) {
      await clearTailwindcssPatcherCache(previousPatcher)
    }
    invalidateRuntimeClassSet(previousPatcher)
    const nextPatcher = createTailwindcssPatcherFromContext(ctx)
    Object.assign(previousPatcher, nextPatcher)
    ctx.twPatcher = previousPatcher
    return previousPatcher
  }
  ctx.refreshTailwindcssPatcher = refreshTailwindcssPatcher
  Object.defineProperty(ctx.twPatcher, refreshTailwindcssPatcherSymbol, {
    value: refreshTailwindcssPatcher,
    configurable: true,
  })
  return ctx
}

/**
 * 获取用户定义选项的内部表示，并初始化相关的处理程序和补丁。
 * @param opts - 用户定义的选项，可选。
 * @returns 返回一个包含内部用户定义选项的对象，包括样式、JS和模板处理程序，以及Tailwind CSS补丁。
 */
export function getCompilerContext(opts?: UserDefinedOptions): InternalUserDefinedOptions {
  return withCompilerContextCache(opts, () => createInternalCompilerContext(opts))
}
