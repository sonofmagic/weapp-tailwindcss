import type { MultiplatformTarget } from './types'

const uniAppV3Platforms = [
  'app',
  'h5',
  'h5:ssr',
  'mp-alipay',
  'mp-baidu',
  'mp-kuaishou',
  'mp-lark',
  'mp-qq',
  'mp-toutiao',
  'mp-weixin',
  'quickapp-webview',
  'quickapp-webview-huawei',
  'quickapp-webview-union',
]

const uniAppV4Platforms = [
  'app',
  'h5',
  'h5:ssr',
  'mp-alipay',
  'mp-baidu',
  'mp-jd',
  'mp-kuaishou',
  'mp-lark',
  'mp-qq',
  'mp-toutiao',
  'mp-weixin',
  'mp-xhs',
  'quickapp-webview',
  'quickapp-webview-huawei',
  'quickapp-webview-union',
]

const taroVitePlatforms = [
  'weapp',
  'swan',
  'alipay',
  'tt',
  'h5',
  'rn',
  'qq',
  'jd',
  'harmony-hybrid',
]

const taroWebpackV3Platforms = [
  'weapp',
  'swan',
  'alipay',
  'tt',
  'h5',
  'rn',
  'qq',
  'jd',
  'quickapp',
]

const taroWebpackV4Platforms = [
  'weapp',
  'swan',
  'alipay',
  'tt',
  'h5',
  'rn',
  'qq',
  'jd',
  'harmony-hybrid',
]

const mpxPlatforms = ['wx', 'ali', 'swan', 'tt', 'dd']

const uniAppXPlatforms = ['mp-weixin', 'app-android', 'app-ios']

function target(options: Omit<MultiplatformTarget, 'coverage'> & {
  coverage?: MultiplatformTarget['coverage']
}): MultiplatformTarget {
  return {
    coverage: 'local',
    ...options,
  }
}

function createUniAppTargets(project: string, platforms: string[]): MultiplatformTarget[] {
  return platforms.map((platform) => {
    const isApp = platform === 'app'
    return target({
      framework: 'uni-app',
      projectDir: `demo/${project}`,
      platform,
      coverage: isApp ? 'local' : 'default-ci',
      reason: isApp ? 'uni-app App 产物依赖本地 App SDK，普通 CI 不默认执行。' : undefined,
    })
  })
}

function createTaroTargets(project: string, platforms: string[]): MultiplatformTarget[] {
  return platforms.map((platform) => {
    const isCiScript = project === 'taro-webpack-react-tailwindcss-v4' && platform === 'alipay'
    return target({
      framework: 'taro',
      projectDir: `demo/${project}`,
      platform,
      coverage: isCiScript ? 'ci-script' : 'local',
      reason: isCiScript
        ? '通过 pnpm e2e:multiplatform-build:taro-alipay 做专项构建与只读断言；本地 Taro runner 可能因系统依赖挂起。'
        : '当前 Taro 目标在本仓 demo 中存在 runner 兼容、平台 SDK 或产物残留问题，登记为全平台 local 候选。',
    })
  })
}

function createMpxTargets(project: string): MultiplatformTarget[] {
  return mpxPlatforms.map(platform => target({
    framework: 'mpx',
    projectDir: `demo/${project}`,
    platform,
    coverage: 'default-ci',
  }))
}

function createUniAppXTargets(project: string): MultiplatformTarget[] {
  return uniAppXPlatforms.map(platform => target({
    framework: 'uni-app-x',
    projectDir: `demo/${project}`,
    platform,
    coverage: 'local',
    reason: 'uni-app x 产物依赖本地 HBuilderX 与微信/Android/iOS SDK，普通 CI 不默认执行。',
  }))
}

export const MULTIPLATFORM_TARGETS: MultiplatformTarget[] = [
  ...createUniAppTargets('uni-app-vite-tailwindcss-v3', uniAppV3Platforms),
  ...createUniAppTargets('uni-app-vite-tailwindcss-v4', uniAppV4Platforms),
  ...createTaroTargets('taro-vite-react-tailwindcss-v3', taroVitePlatforms),
  ...createTaroTargets('taro-vite-react-tailwindcss-v4', taroVitePlatforms),
  ...createTaroTargets('taro-webpack-react-tailwindcss-v3', taroWebpackV3Platforms),
  ...createTaroTargets('taro-webpack-react-tailwindcss-v4', taroWebpackV4Platforms),
  ...createMpxTargets('mpx-tailwindcss-v3'),
  ...createMpxTargets('mpx-tailwindcss-v4'),
  ...createUniAppXTargets('uni-app-x-hbuilderx-tailwindcss-v3'),
  ...createUniAppXTargets('uni-app-x-hbuilderx-tailwindcss-v4'),
]
