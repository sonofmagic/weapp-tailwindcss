import process from 'node:process'
import { E2E_PROJECTS, NATIVE_PROJECTS } from './projectEntries'

export const HOT_UPDATE_TARGETS = [
  {
    name: 'demo',
    title: 'demo hot updates',
  },
  {
    name: 'apps',
    title: 'apps hot updates',
  },
] as const

export type HotUpdateTargetName = typeof HOT_UPDATE_TARGETS[number]['name']

export const HOT_UPDATE_CASES_BY_TARGET: Record<HotUpdateTargetName, string[]> = {
  demo: [
    'weapp-vite',
    'taro',
    'mpx',
    'uni-app-vue3-vite',
    'uni-app-tailwindcss-v4',
    'mpx-tailwindcss-v4',
    'taro-vite-tailwindcss-v4',
    'taro-app-vite',
    'taro-webpack-tailwindcss-v4',
    'taro-vue3-app',
  ],
  apps: [
    'vite-native-ts',
    'vite-native',
    'vite-native-ts-skyline',
    'vite-native-skyline',
    'taro-webpack',
  ],
}

export const HOT_UPDATE_COVERED_PROJECTS = new Set([
  'uni-app-vue3-vite',
  'uni-app-tailwindcss-v4',
  'taro-app',
  'taro-webpack-tailwindcss-v4',
  'taro-app-vite',
  'taro-vite-tailwindcss-v4',
  'taro-vue3-app',
  'mpx-app',
  'mpx-tailwindcss-v4',
  'vite-native',
  'vite-native-ts',
])

// 这些项目没有稳定的 dev/hot-update 链路，默认只保留静态产物 e2e。
export const HOT_UPDATE_EXEMPT_PROJECTS = new Set([
  'gulp-app',
  'web-postcss7-compat',
])

export function getAllStaticE2EProjectNames() {
  return [...E2E_PROJECTS, ...NATIVE_PROJECTS].map(item => item.name)
}

export function resolveHotUpdateTargets(value = process.env.E2E_HOT_UPDATE_TARGET) {
  if (value === 'demo' || value === 'apps') {
    return HOT_UPDATE_TARGETS.filter(item => item.name === value)
  }

  return [...HOT_UPDATE_TARGETS]
}
