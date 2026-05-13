import process from 'node:process'
import { E2E_PROJECTS, NATIVE_PROJECTS } from './projectEntries'

export const HOT_UPDATE_TARGETS = [
  {
    name: 'demo',
    title: 'demo hot updates',
  },
] as const

export type HotUpdateTargetName = typeof HOT_UPDATE_TARGETS[number]['name']

const DEMO_HOT_UPDATE_CASES = [
  'gulp-tailwindcss-v3',
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v3',
  'mpx-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v3',
  'taro-webpack-react-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v3',
  'taro-vite-react-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v3',
  'uni-app-vite-tailwindcss-v4',
  'weapp-vite-tailwindcss-v3',
  'weapp-vite-tailwindcss-v4',
] as const

export const HOT_UPDATE_CASES_BY_TARGET: Record<HotUpdateTargetName, string[]> = {
  demo: [...DEMO_HOT_UPDATE_CASES],
}

export const HOT_UPDATE_CI_CASES = [...DEMO_HOT_UPDATE_CASES] as const

export const HOT_UPDATE_COVERED_PROJECTS = new Set(DEMO_HOT_UPDATE_CASES)

// 这些项目没有稳定的 dev/hot-update 链路，默认只保留静态产物 e2e。
export const HOT_UPDATE_EXEMPT_PROJECTS = new Set<string>()
HOT_UPDATE_EXEMPT_PROJECTS.add('taro-webpack-vue3-tailwindcss-v3')
HOT_UPDATE_EXEMPT_PROJECTS.add('taro-webpack-vue3-tailwindcss-v4')
HOT_UPDATE_EXEMPT_PROJECTS.add('taro-vite-vue3-tailwindcss-v3')
HOT_UPDATE_EXEMPT_PROJECTS.add('taro-vite-vue3-tailwindcss-v4')

export function getAllStaticE2EProjectNames() {
  return [...E2E_PROJECTS, ...NATIVE_PROJECTS].map(item => item.name)
}

export function resolveHotUpdateTargets(value = process.env.E2E_HOT_UPDATE_TARGET) {
  if (value === 'demo') {
    return HOT_UPDATE_TARGETS.filter(item => item.name === value)
  }

  return [...HOT_UPDATE_TARGETS]
}
