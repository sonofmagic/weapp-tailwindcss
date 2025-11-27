import type { InternalUserDefinedOptions, RefreshTailwindcssPatcherOptions, TailwindcssPatcherLike, UserDefinedOptions } from '@/types'
import { rm } from 'node:fs/promises'
import { logger, pc } from '@weapp-tailwindcss/logger'
import { initializeCache } from '@/cache'
import { getDefaultOptions } from '@/defaults'
import { invalidateRuntimeClassSet, refreshTailwindcssPatcherSymbol } from '@/tailwindcss/runtime'
import { logTailwindcssTarget } from '@/tailwindcss/targets'
import { defuOverrideArray } from '@/utils'
import { withCompilerContextCache } from './compiler-context-cache'
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

function normalizeCssEntriesConfig(entries: unknown) {
  if (!entries) {
    return undefined
  }

  if (typeof entries === 'string') {
    const trimmed = entries.trim()
    return trimmed ? [trimmed] : undefined
  }

  if (!Array.isArray(entries)) {
    return undefined
  }

  const normalized = entries
    .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(entry => entry.length > 0)

  return normalized.length > 0 ? normalized : undefined
}

function hasConfiguredCssEntries(ctx: InternalUserDefinedOptions) {
  if (normalizeCssEntriesConfig(ctx.cssEntries)) {
    return true
  }

  if (normalizeCssEntriesConfig(ctx.tailwindcss?.v4?.cssEntries)) {
    return true
  }

  const patcherOptions = ctx.tailwindcssPatcherOptions as any
  if (patcherOptions) {
    if (normalizeCssEntriesConfig(patcherOptions.tailwind?.v4?.cssEntries)) {
      return true
    }
    if (normalizeCssEntriesConfig(patcherOptions.patch?.tailwindcss?.v4?.cssEntries)) {
      return true
    }
  }

  return false
}

let hasWarnedMissingCssEntries = false

function warnMissingCssEntries(
  ctx: InternalUserDefinedOptions,
  patcher: TailwindcssPatcherLike | undefined,
) {
  if (hasWarnedMissingCssEntries) {
    return
  }

  if (patcher?.majorVersion !== 4) {
    return
  }

  if (hasConfiguredCssEntries(ctx)) {
    return
  }

  hasWarnedMissingCssEntries = true
  logger.warn(
    '[tailwindcss@4] 未检测到 cssEntries 配置。请传入包含 tailwindcss 引用的 CSS 绝对路径，例如 cssEntries: ["/absolute/path/to/src/app.css"]，否则 tailwindcss 生成的类名不会参与转译。',
  )
}

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
