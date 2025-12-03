import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import { logger } from '@weapp-tailwindcss/logger'

// 默认保留列表暂为空，后续若有新增默认变量再补充到该数组
export const DEFAULT_CSS_CALC_CUSTOM_PROPERTIES: (string | RegExp)[] = []

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

export function normalizeCssEntriesConfig(entries: unknown) {
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

export function warnMissingCssEntries(
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

export function applyV4CssCalcDefaults(
  cssCalc: InternalUserDefinedOptions['cssCalc'],
  patcher: TailwindcssPatcherLike | undefined,
): InternalUserDefinedOptions['cssCalc'] {
  const cssCalcOptions = cssCalc ?? patcher?.majorVersion === 4

  if (patcher?.majorVersion === 4 && cssCalcOptions) {
    return ensureDefaultsIncluded(cssCalcOptions)
  }

  return cssCalcOptions
}
