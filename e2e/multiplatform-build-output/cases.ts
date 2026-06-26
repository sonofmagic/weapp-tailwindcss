import type { BuildOutputCase } from './types'
import process from 'node:process'
import {
  gulpMiniCase,
  mpxCase,
  taroMiniCase,
  taroSubpackageH5Case,
  taroSubpackageMiniCase,
  uniAppH5Case,
  uniAppH5SsrCase,
  uniAppHBuilderXMiniCase,
  uniAppMiniCase,
  uniAppQuickappCase,
  uniAppSubpackageH5Case,
  uniAppSubpackageMiniCase,
} from './case-factories'
import { createLocalTargetCase, uniqueTargetKey } from './helpers'
import { MULTIPLATFORM_TARGETS } from './targets'

const uniAppV4StyleContains = ['.bg-_b_h0000ff_B', '.i-mdi-home', '.before_ccontent']
const gulpV4StyleContains = ['.text-_b_h123456_B', '.i-mdi-ab-testing', '.bg-normal-subpackage-marker', '.before_ccontent']
const gulpTextContains = ['bg-_burl', 'text-_b_h123456_B', 'bg-normal-subpackage-marker']
const taroSubpackageMarkers = {
  main: 'bg-twv4-taro-main',
  normal: 'bg-twv4-taro-normal',
  independent: 'bg-twv4-taro-independent',
}
const uniAppSubpackageMarkers = {
  main: 'bg-twv4-uni-main',
  normal: 'bg-twv4-uni-normal',
  independent: 'bg-twv4-uni-independent',
}

export const EXECUTABLE_MULTIPLATFORM_BUILD_OUTPUT_CASES: BuildOutputCase[] = [
  gulpMiniCase({
    project: 'gulp-tailwindcss-v4',
    platform: 'tt',
    styleContains: gulpV4StyleContains,
    textContains: gulpTextContains,
  }),
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
  ...(['mp-weixin', 'mp-alipay', 'mp-toutiao'] as const).flatMap(platform =>
    (['isolated', 'single'] as const).map(mode =>
      uniAppSubpackageMiniCase({
        project: 'subpackage-uni-app-vite-tailwindcss-v4',
        platform,
        mode,
        markers: uniAppSubpackageMarkers,
      }),
    ),
  ),
  ...(['isolated', 'single'] as const).flatMap(mode => [
    uniAppSubpackageH5Case({
      project: 'subpackage-uni-app-vite-tailwindcss-v4',
      mode,
      markers: uniAppSubpackageMarkers,
    }),
    uniAppSubpackageH5Case({
      project: 'subpackage-uni-app-vite-tailwindcss-v4',
      mode,
      ssr: true,
      markers: uniAppSubpackageMarkers,
    }),
  ]),
  ...(['quickapp-webview', 'quickapp-webview-huawei', 'quickapp-webview-union'] as const).map(platform =>
    uniAppQuickappCase({
      project: 'uni-app-vite-tailwindcss-v4',
      platform,
      styleContains: ['bg-_b_h0000ff_B'],
    }),
  ),
  uniAppHBuilderXMiniCase({
    project: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    version: 'v4',
  }),
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
    styleContains: ['.bg-_b_h534312_B', '.text-_b_hfff_B', '.before_ccontent'],
    textContains: ['bg-_b_h534312_B', 'text-_b_hfff_B'],
    reason: 'Taro Alipay 通过 pnpm e2e:multiplatform-build:taro-alipay 做专项构建与只读断言；本地 Taro runner 可能因系统依赖挂起，不放入默认 vitest/execa 构建集合。',
  }),
  taroMiniCase({
    project: 'taro-vite-react-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/taro-vite-react-tailwindcss-v4',
    platform: 'alipay',
    styleContains: ['.bg-_b_h123456_B', '.text-_b_hfff_B'],
    textContains: ['bg-_b_h123456_B', 'text-_b_hfff_B'],
    status: 'ci',
  }),
  taroMiniCase({
    project: 'taro-vite-react-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/taro-vite-react-tailwindcss-v4',
    platform: 'tt',
    styleContains: ['.bg-_b_h123456_B', '.text-_b_hfff_B'],
    textContains: ['bg-_b_h123456_B', 'text-_b_hfff_B'],
    status: 'ci',
  }),
  taroMiniCase({
    project: 'issue-951-taro-vite-react-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/issue-951-taro-vite-react-tailwindcss-v4',
    platform: 'alipay',
    styleContains: ['.bg-issue-951-main', '.bg-issue-951-normal', '.bg-issue-951-independent'],
    textContains: ['bg-issue-951-main'],
    fileAssertions: [
      {
        file: 'dist/app-origin.acss',
        contains: ['.bg-issue-951-main'],
        notContains: ['.bg-issue-951-normal', '.bg-issue-951-independent'],
      },
      {
        file: 'dist/pages/index/index.acss',
        contains: ['.issue-951-page-local'],
        notContains: ['.bg-issue-951-main', '.bg-issue-951-normal', '.bg-issue-951-independent'],
      },
      {
        file: 'dist/sub-normal/pages/index.acss',
        contains: ['.bg-issue-951-normal'],
        notContains: ['.bg-issue-951-main', '.bg-issue-951-independent'],
      },
      {
        file: 'dist/sub-independent/pages/index.acss',
        contains: ['.bg-issue-951-independent'],
        notContains: ['.bg-issue-951-main', '.bg-issue-951-normal'],
      },
    ],
    status: 'ci',
  }),
  ...(['alipay', 'tt'] as const).flatMap(platform =>
    (['isolated', 'single'] as const).map(mode =>
      taroSubpackageMiniCase({
        project: 'subpackage-taro-webpack-react-tailwindcss-v4',
        packageName: '@weapp-tailwindcss-demo/subpackage-taro-webpack-react-tailwindcss-v4',
        platform,
        mode,
        markers: taroSubpackageMarkers,
      }),
    ),
  ),
  ...(['isolated', 'single'] as const).map(mode =>
    taroSubpackageH5Case({
      project: 'subpackage-taro-webpack-react-tailwindcss-v4',
      packageName: '@weapp-tailwindcss-demo/subpackage-taro-webpack-react-tailwindcss-v4',
      mode,
      markers: taroSubpackageMarkers,
    }),
  ),
  taroMiniCase({
    project: 'issue-951-taro-vite-react-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/issue-951-taro-vite-react-tailwindcss-v4',
    platform: 'tt',
    styleContains: ['.bg-issue-951-main', '.bg-issue-951-normal', '.bg-issue-951-independent'],
    textContains: ['bg-issue-951-main'],
    fileAssertions: [
      {
        file: 'dist/app-origin.ttss',
        contains: ['.bg-issue-951-main'],
        notContains: ['.bg-issue-951-normal', '.bg-issue-951-independent'],
      },
      {
        file: 'dist/pages/index/index.ttss',
        contains: ['.issue-951-page-local'],
        notContains: ['.bg-issue-951-main', '.bg-issue-951-normal', '.bg-issue-951-independent'],
      },
      {
        file: 'dist/sub-normal/pages/index.ttss',
        contains: ['.bg-issue-951-normal'],
        notContains: ['.bg-issue-951-main', '.bg-issue-951-independent'],
      },
      {
        file: 'dist/sub-independent/pages/index.ttss',
        contains: ['.bg-issue-951-independent'],
        notContains: ['.bg-issue-951-main', '.bg-issue-951-normal'],
      },
    ],
    status: 'ci',
  }),
  taroMiniCase({
    project: 'taro-vite-vue3-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/taro-vite-vue3-tailwindcss-v4',
    platform: 'alipay',
    styleContains: ['.bg-_b_h123456_B', '.text-_b_hfff_B'],
    textContains: ['bg-_b_h123456_B', 'text-_b_hfff_B'],
    status: 'ci',
  }),
  taroMiniCase({
    project: 'taro-vite-vue3-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/taro-vite-vue3-tailwindcss-v4',
    platform: 'tt',
    styleContains: ['.bg-_b_h123456_B', '.text-_b_hfff_B'],
    textContains: ['bg-_b_h123456_B', 'text-_b_hfff_B'],
    status: 'ci',
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
