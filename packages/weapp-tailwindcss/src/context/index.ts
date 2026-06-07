import type { InternalUserDefinedOptions, RefreshTailwindcssPatcherOptions, TailwindcssPatcherLike, UserDefinedOptions } from '@/types'
import { rm } from 'node:fs/promises'
import { logger } from '@weapp-tailwindcss/logger'
import { initializeCache } from '@/cache'
import { getDefaultOptions, resolveDefaultCssPreflight } from '@/defaults'
import { invalidateRuntimeClassSet, refreshTailwindcssPatcherSymbol } from '@/tailwindcss/runtime'
import { logRuntimeTailwindcssVersion } from '@/tailwindcss/runtime-logs'
import { logTailwindcssTarget } from '@/tailwindcss/targets'
import { applyV4CssCalcDefaults, warnMissingCssEntries } from '@/tailwindcss/v4'
import { resolveUniAppXOptions } from '@/uni-app-x/options'
import { resolveUnocssBareArbitraryValues } from '@/unocss'
import { defuOverrideArray } from '@/utils'
import { withCompilerContextCache } from './compiler-context-cache'
import { toCustomAttributesEntities } from './custom-attributes'
import { createHandlersFromContext } from './handlers'
import { applyLoggerLevel } from './logger'
import { createTailwindcssPatcherFromContext } from './tailwindcss'

interface ClearTailwindcssPatcherCacheOptions {
  removeDirectory?: boolean
}

function resolveContextCssPreflight(opts: UserDefinedOptions | undefined, ctx: InternalUserDefinedOptions, majorVersion: number | undefined) {
  const cssPreflight = resolveDefaultCssPreflight(opts?.cssPreflight, majorVersion)
  if (majorVersion !== 4 || cssPreflight === false || !resolveUniAppXOptions(ctx.uniAppX).enabled) {
    return cssPreflight
  }
  const userCssPreflight = opts?.cssPreflight && typeof opts.cssPreflight === 'object'
    ? opts.cssPreflight
    : undefined
  return {
    ...cssPreflight,
    'border-width': userCssPreflight && 'border-width' in userCssPreflight
      ? cssPreflight['border-width']
      : '0',
    'border-style': userCssPreflight && 'border-style' in userCssPreflight
      ? cssPreflight['border-style']
      : false,
    'border': userCssPreflight && 'border' in userCssPreflight
      ? cssPreflight.border
      : false,
  }
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

  if (typeof (patcher as any).clearCache === 'function') {
    try {
      await (patcher as any).clearCache({ scope: 'all' })
    }
    catch (error) {
      logger.debug('failed to clear tailwindcss patcher cache via clearCache(): %O', error)
    }
  }

  if (!options?.removeDirectory) {
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

  ctx.arbitraryValues = resolveUnocssBareArbitraryValues(ctx.arbitraryValues, ctx.unocss)
  ctx.escapeMap = ctx.customReplaceDictionary

  applyLoggerLevel(ctx.logLevel)

  const twPatcher = createTailwindcssPatcherFromContext(ctx) as TailwindcssPatcherLike
  logTailwindcssTarget(twPatcher, ctx.tailwindcssBasedir)
  logRuntimeTailwindcssVersion(
    ctx.tailwindcssBasedir,
    twPatcher.packageInfo?.rootPath,
    twPatcher.packageInfo?.version,
  )

  if ((opts as any)?.__internalDeferMissingCssEntriesWarning !== true) {
    warnMissingCssEntries(ctx, twPatcher)
  }

  ctx.cssPreflight = resolveContextCssPreflight(opts, ctx, twPatcher.majorVersion)

  const cssCalcOptions = applyV4CssCalcDefaults(ctx.cssCalc, twPatcher)
  ctx.cssCalc = cssCalcOptions

  const customAttributesEntities = toCustomAttributesEntities(ctx.customAttributes)

  const { styleHandler, jsHandler, templateHandler } = createHandlersFromContext(
    ctx,
    customAttributesEntities,
    cssCalcOptions,
    twPatcher.majorVersion,
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
 * 获取用户定义选项的内部表示，并初始化相关的处理程序和 Tailwind 运行时。
 * @param opts - 用户定义的选项，可选。
 * @returns 返回一个包含内部用户定义选项的对象，包括样式、JS 和模板处理程序，以及 Tailwind CSS 运行时。
 */
export function getCompilerContext(opts?: UserDefinedOptions): InternalUserDefinedOptions {
  return withCompilerContextCache(opts, () => createInternalCompilerContext(opts))
}
