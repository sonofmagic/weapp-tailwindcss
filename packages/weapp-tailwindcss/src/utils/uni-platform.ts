import process from 'node:process'

export interface UniUtsPlatformInfo {
  raw: string | undefined
  normalized: string | undefined
  isApp: boolean
  isAppAndroid: boolean
  isAppHarmony: boolean
  isAppIos: boolean
  isMp: boolean
  isWeb: boolean
}

function normalizePlatform(value: string | undefined) {
  return value?.trim().toLowerCase() || undefined
}

export function resolveUniUtsPlatform(value = process.env.UNI_UTS_PLATFORM): UniUtsPlatformInfo {
  const normalized = normalizePlatform(value)
  const isAppAndroid = normalized === 'app-android'
  const isAppIos = normalized === 'app-ios'
  const isAppHarmony = normalized === 'app-harmony'
  const isApp = normalized?.startsWith('app-') === true || normalized === 'app' || normalized === 'app-plus'
  const isMp = normalized?.startsWith('mp-') === true
  const isWeb = normalized?.startsWith('web') === true || normalized === 'h5'

  return {
    raw: value,
    normalized,
    isApp,
    isAppAndroid,
    isAppHarmony,
    isAppIos,
    isMp,
    isWeb,
  }
}
