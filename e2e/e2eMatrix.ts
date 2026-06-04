import process from 'node:process'
import path from 'pathe'
import { buildCases } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'
import { E2E_PROJECTS, NATIVE_PROJECTS } from './projectEntries'

export const HOT_UPDATE_TARGETS = [
  {
    name: 'demo',
    title: 'demo hot updates',
  },
] as const

export type HotUpdateTargetName = typeof HOT_UPDATE_TARGETS[number]['name']

const repoRoot = path.resolve(import.meta.dirname, '..')
const DEMO_HOT_UPDATE_CASES = buildCases(repoRoot)
  .filter(item => item.group === 'demo')
  .map(item => item.name)
const DEMO_LOCAL_HOT_UPDATE_CASES = buildCases(repoRoot, {
  includeLocalOnly: true,
})
  .filter(item => item.group === 'demo' && !DEMO_HOT_UPDATE_CASES.includes(item.name))
  .map(item => item.name)

export const HOT_UPDATE_CASES_BY_TARGET: Record<HotUpdateTargetName, string[]> = {
  demo: [...DEMO_HOT_UPDATE_CASES],
}

export const HOT_UPDATE_CI_CASES = [...DEMO_HOT_UPDATE_CASES]

export const HOT_UPDATE_COVERED_PROJECTS = new Set([
  ...DEMO_HOT_UPDATE_CASES,
  ...DEMO_LOCAL_HOT_UPDATE_CASES,
])

// 这些项目没有稳定的 dev/hot-update 链路，默认只保留静态产物 e2e。
export const HOT_UPDATE_EXEMPT_PROJECTS = new Set<string>()

export function getAllStaticE2EProjectNames() {
  return [...E2E_PROJECTS, ...NATIVE_PROJECTS].map(item => item.name)
}

export function resolveHotUpdateTargets(value = process.env.E2E_HOT_UPDATE_TARGET) {
  if (value === 'demo') {
    return HOT_UPDATE_TARGETS.filter(item => item.name === value)
  }

  return [...HOT_UPDATE_TARGETS]
}
