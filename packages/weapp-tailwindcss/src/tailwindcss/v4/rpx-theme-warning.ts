import type { InternalUserDefinedOptions } from '@/types'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { collectRpxThemeVariables, inspectRpxCalcUsage } from '@weapp-tailwindcss/postcss'
import { normalizeFrameworkStylePlatform } from '@/framework/platform'

const warnedSessions = new WeakSet<object>()

export function shouldCheckRpxThemeRisk(
  session: object,
  target: string,
  opts: Pick<InternalUserDefinedOptions, 'logLevel' | 'platform' | 'cssOptions' | 'appType'>,
  platform?: string,
) {
  if (target !== 'weapp' || warnedSessions.has(session) || opts.logLevel === 'silent' || opts.logLevel === 'error') {
    return false
  }
  const resolved = normalizeFrameworkStylePlatform(
    platform ?? opts.cssOptions?.platform ?? opts.platform
    ?? process.env.UNI_UTS_PLATFORM ?? process.env.UNI_PLATFORM
    ?? process.env.TARO_ENV ?? process.env.MPX_CURRENT_TARGET_MODE ?? process.env.MPX_CLI_MODE,
    opts.appType,
  )
  // weapp 是通用输出目标，只有明确的微信平台才启用微信运行时诊断。
  return resolved === 'mp-weixin' || resolved === 'weapp' || resolved === 'wx' || resolved === 'weixin'
}

export function collectRpxThemeRiskSources(sources: Iterable<string>) {
  const variables = new Set<string>()
  for (const css of new Set(sources)) {
    for (const name of collectRpxThemeVariables(css)) {
      variables.add(name)
    }
  }
  return [...variables]
}

export function warnRpxThemeRisk(session: object, variables: readonly string[], outputCss: string) {
  if (warnedSessions.has(session) || variables.length === 0) {
    return
  }
  const usage = inspectRpxCalcUsage(outputCss, new Set(variables))
  const runtimeHint = usage === undefined
    ? '当前 CSS 无法完成诊断，请检查最终 WXSS。'
    : usage.variables.length > 0 || usage.inlineRpx
      ? `当前输出仍含运行时 calc：${[...usage.variables, ...(usage.inlineRpx ? ['内联 rpx'] : [])].join(', ')}。`
      : '当前输出未检测到相关运行时 calc；这不代表已验证所有作用域和设备。'
  warnedSessions.add(session)
  logger.warn(
    `[tailwindcss@4][rpx-theme] @theme 中使用 rpx 的主题变量：${variables.join(', ')}。${runtimeHint} 微信 WXSS 可能先独立换算或量化基数再乘法，造成尺寸偏差，具体取整算法尚未确认。固定像素尺寸优先使用 px，需要缩放时在构建期输出最终静态 rpx；偶数或较大 rpx 也不保证准确。请检查最终 WXSS 并在目标设备验证：https://tw.weapp.dev/docs/issues/spacing-rpx`,
  )
}
