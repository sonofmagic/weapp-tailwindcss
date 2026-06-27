import type { DetectableAppType } from './index'

const MPX_TO_UNI_PLATFORM: Record<string, string> = {
  ali: 'mp-alipay',
  dd: 'mp-dingtalk',
  jd: 'mp-jd',
  qq: 'mp-qq',
  swan: 'mp-baidu',
  tt: 'mp-toutiao',
  wx: 'mp-weixin',
}

export function normalizeFrameworkStylePlatform(
  platform: string | undefined,
  appType: DetectableAppType | undefined,
) {
  const normalized = platform?.trim().toLowerCase()
  if (!normalized) {
    return undefined
  }
  if (appType === 'mpx') {
    return MPX_TO_UNI_PLATFORM[normalized] ?? normalized
  }
  return normalized
}
