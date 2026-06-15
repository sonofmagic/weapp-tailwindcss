import process from 'node:process'
import { resolveUniUtsPlatform as resolveFrameworkUniUtsPlatform } from '@/framework'

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

export function resolveUniUtsPlatform(value = process.env['UNI_UTS_PLATFORM']): UniUtsPlatformInfo {
  return resolveFrameworkUniUtsPlatform(value)
}
