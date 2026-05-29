import type { BuildOutputCase } from './types'
import process from 'node:process'
import {
  mpxCase,
  taroMiniCase,
  uniAppH5Case,
  uniAppH5SsrCase,
  uniAppMiniCase,
  uniAppQuickappCase,
} from './case-factories'
import { createLocalTargetCase, uniqueTargetKey } from './helpers'
import { MULTIPLATFORM_TARGETS } from './targets'

const uniAppV3StyleContains = ['.bg-_b_h123456_B', '.i-mdi-home', '.before_ccontent']
const uniAppV4StyleContains = ['.bg-_b_h0000ff_B', '.i-mdi-home', '.before_ccontent']

export const EXECUTABLE_MULTIPLATFORM_BUILD_OUTPUT_CASES: BuildOutputCase[] = [
  ...(['mp-alipay', 'mp-baidu', 'mp-kuaishou', 'mp-lark', 'mp-qq', 'mp-toutiao', 'mp-weixin'] as const).map(platform =>
    uniAppMiniCase({
      project: 'uni-app-vite-tailwindcss-v3',
      platform,
      styleContains: uniAppV3StyleContains,
      textFile: platform === 'mp-alipay' ? 'pages/index/index.axml' : undefined,
      textContains: platform === 'mp-alipay' ? ['bg-_b_h123456_B'] : undefined,
    }),
  ),
  uniAppH5Case({
    project: 'uni-app-vite-tailwindcss-v3',
    styleContains: ['.i-mdi-home', 'box-sizing'],
  }),
  uniAppH5SsrCase({
    project: 'uni-app-vite-tailwindcss-v3',
    styleContains: ['.i-mdi-home', 'box-sizing'],
  }),
  ...(['quickapp-webview', 'quickapp-webview-huawei', 'quickapp-webview-union'] as const).map(platform =>
    uniAppQuickappCase({
      project: 'uni-app-vite-tailwindcss-v3',
      platform,
      styleContains: ['bg-_b_h123456_B'],
    }),
  ),
  ...(['mp-alipay', 'mp-baidu', 'mp-jd', 'mp-kuaishou', 'mp-lark', 'mp-qq', 'mp-toutiao', 'mp-weixin', 'mp-xhs'] as const).map(platform =>
    uniAppMiniCase({
      project: 'uni-app-vite-tailwindcss-v4',
      platform,
      styleContains: uniAppV4StyleContains,
      textFile: platform === 'mp-alipay' || platform === 'mp-baidu' ? 'pages/index/index.js' : undefined,
      textContains: platform === 'mp-alipay' || platform === 'mp-baidu' ? ['bg-_b_h0000ff_B'] : undefined,
    }),
  ),
  uniAppH5Case({
    project: 'uni-app-vite-tailwindcss-v4',
    styleContains: ['.i-mdi-home', 'box-sizing'],
  }),
  uniAppH5SsrCase({
    project: 'uni-app-vite-tailwindcss-v4',
    styleContains: ['.i-mdi-home', 'box-sizing'],
  }),
  ...(['quickapp-webview', 'quickapp-webview-huawei', 'quickapp-webview-union'] as const).map(platform =>
    uniAppQuickappCase({
      project: 'uni-app-vite-tailwindcss-v4',
      platform,
      styleContains: ['bg-_b_h0000ff_B'],
    }),
  ),
  ...(['wx', 'ali', 'swan', 'tt', 'dd'] as const).map(platform =>
    mpxCase({
      project: 'mpx-tailwindcss-v3',
      version: 'v3',
      platform,
      command: platform === 'wx'
        ? ['pnpm', 'run', 'build']
        : ['pnpm', 'run', 'build', '--', '--mode', platform],
      env: {
        MPX_CURRENT_TARGET_MODE: platform,
      },
    }),
  ),
  ...(['wx', 'ali', 'swan', 'tt', 'dd'] as const).map(platform =>
    mpxCase({
      project: 'mpx-tailwindcss-v4',
      version: 'v4',
      platform,
      command: platform === 'wx'
        ? ['pnpm', 'exec', 'mpx-cli-service', 'build']
        : ['pnpm', 'exec', 'mpx-cli-service', 'build', '--mode', platform],
      env: {
        MPX_CURRENT_TARGET_MODE: platform,
      },
    }),
  ),
  taroMiniCase({
    project: 'taro-webpack-react-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/taro-webpack-react-tailwindcss-v4',
    platform: 'alipay',
  }),
]

const executableCaseKeys = new Set(EXECUTABLE_MULTIPLATFORM_BUILD_OUTPUT_CASES.map(uniqueTargetKey))

export const MULTIPLATFORM_BUILD_OUTPUT_CASES: BuildOutputCase[] = [
  ...EXECUTABLE_MULTIPLATFORM_BUILD_OUTPUT_CASES,
  ...MULTIPLATFORM_TARGETS
    .filter(item => !executableCaseKeys.has(uniqueTargetKey(item)))
    .map(item => createLocalTargetCase({
      name: `${item.projectDir.replace('demo/', '')} ${item.platform}`,
      framework: item.framework,
      projectDir: item.projectDir,
      platform: item.platform,
      reason: item.reason ?? '该平台已纳入全平台清单，但不属于默认 CI 可执行产物集合。',
    })),
]

export function getMultiplatformBuildOutputCases() {
  const filter = process.env['E2E_MULTIPLATFORM_BUILD_CASE']
  const status = process.env['E2E_MULTIPLATFORM_BUILD_STATUS'] ?? 'ci'
  let cases = MULTIPLATFORM_BUILD_OUTPUT_CASES

  if (status !== 'all') {
    cases = cases.filter(item => item.status === status)
  }

  if (!filter) {
    return cases
  }

  const pattern = new RegExp(filter)
  return cases.filter(item => pattern.test(item.name) || pattern.test(item.projectDir) || pattern.test(item.platform))
}
