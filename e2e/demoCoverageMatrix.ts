import fs from 'node:fs'
import path from 'pathe'
import { HOT_UPDATE_CI_CASES } from './e2eMatrix'

export type DemoFramework
  = | 'gulp'
    | 'mpx'
    | 'taro-react'
    | 'taro-vue3'
    | 'uni-app'
    | 'uni-app-x'
    | 'weapp-vite'
    | 'web-vite-react'
    | 'web-vite-vue'

export type DemoCoverageStatus = 'automated' | 'local' | 'exempt'

export interface DemoPlatformCoverage {
  platform: string
  buildScript?: string
  devScript?: string
  staticCoverage: DemoCoverageStatus
  hmrCoverage: DemoCoverageStatus
  evidence: string
  command: string
  reason?: string
}

export interface DemoCoverageEntry {
  name: string
  packageJson: string
  framework: DemoFramework
  builder: string
  tailwindcss: 'v3' | 'v4'
  sourceShape: 'native' | 'tsx' | 'vue-sfc' | 'mpx-sfc' | 'uvue' | 'web-tsx' | 'web-vue-sfc'
  sfcBlocks: Array<'template' | 'script' | 'style'>
  hbuilderxLocal: boolean
  platforms: DemoPlatformCoverage[]
}

export const HMR_THREE_BLOCK_EVIDENCE = 'watch-HMR report requires template/script/style mutation metrics'

function automated(platform: string, options: {
  buildScript?: string
  devScript?: string
  evidence: string
  command: string
}): DemoPlatformCoverage {
  return {
    platform,
    staticCoverage: 'automated',
    hmrCoverage: 'automated',
    ...(options.buildScript ? { buildScript: options.buildScript } : {}),
    ...(options.devScript ? { devScript: options.devScript } : {}),
    evidence: options.evidence,
    command: options.command,
  }
}

function local(platform: string, options: {
  buildScript?: string
  devScript?: string
  evidence: string
  command: string
  reason: string
  staticCoverage?: DemoCoverageStatus
  hmrCoverage?: DemoCoverageStatus
}): DemoPlatformCoverage {
  return {
    platform,
    staticCoverage: options.staticCoverage ?? 'local',
    hmrCoverage: options.hmrCoverage ?? 'local',
    ...(options.buildScript ? { buildScript: options.buildScript } : {}),
    ...(options.devScript ? { devScript: options.devScript } : {}),
    evidence: options.evidence,
    command: options.command,
    reason: options.reason,
  }
}

function entry(options: DemoCoverageEntry): DemoCoverageEntry {
  return options
}

const repoRoot = path.resolve(import.meta.dirname, '..')

function pkg(name: string) {
  return name.startsWith('web/')
    ? `demo/${name}/package.json`
    : `demo/${name}/package.json`
}

function demoCommand(name: string, script: string) {
  const filter = name.startsWith('web/')
    ? `@weapp-tailwindcss-demo/web-${name.slice(4)}`
    : `@weapp-tailwindcss-demo/${name}`
  return `pnpm --filter ${filter} run ${script}`
}

function taroWebHmrCaseName(name: string) {
  return name.replaceAll('-', ' ').replace('tailwindcss v', 'Tailwind v')
}

const taroVitePlatforms = ['weapp', 'swan', 'alipay', 'tt', 'h5', 'rn', 'qq', 'jd', 'harmony-hybrid']
const taroWebpackV3Platforms = ['weapp', 'swan', 'alipay', 'tt', 'h5', 'rn', 'qq', 'jd', 'quickapp']
const taroWebpackV4Platforms = ['weapp', 'swan', 'alipay', 'tt', 'h5', 'rn', 'qq', 'jd', 'harmony-hybrid']
const uniAppV3Platforms = ['app', 'h5', 'h5:ssr', 'mp-alipay', 'mp-baidu', 'mp-kuaishou', 'mp-lark', 'mp-qq', 'mp-toutiao', 'mp-weixin', 'quickapp-webview', 'quickapp-webview-huawei', 'quickapp-webview-union']
const uniAppV4Platforms = ['app', 'h5', 'h5:ssr', 'mp-alipay', 'mp-baidu', 'mp-jd', 'mp-kuaishou', 'mp-lark', 'mp-qq', 'mp-toutiao', 'mp-weixin', 'mp-xhs', 'quickapp-webview', 'quickapp-webview-huawei', 'quickapp-webview-union']

function gulpPlatforms(name: string): DemoPlatformCoverage[] {
  return [
    automated('weapp', {
      buildScript: 'build',
      devScript: 'dev',
      evidence: 'e2e static project test + watch-hmr case',
      command: `E2E_PROJECT_FILTER=${name} pnpm e2e:static && E2E_HOT_UPDATE_CASE_NAME=${name} pnpm e2e:hot-update:demo`,
    }),
    local('tt', {
      buildScript: 'build:tt',
      devScript: 'dev:tt',
      evidence: 'multiplatform local target',
      command: demoCommand(name, 'build:tt'),
      reason: '头条平台 gulp 输出已登记为本地平台路径，默认 CI 只执行 weapp 热更新长链路。',
      hmrCoverage: 'exempt',
    }),
  ]
}

function mpxPlatforms(name: string): DemoPlatformCoverage[] {
  return ['wx', 'ali', 'swan', 'tt', 'dd'].map((platform) => {
    const base = {
      buildScript: platform === 'wx' ? 'build' : `build -- --mode ${platform}`,
      evidence: 'e2e static project test + multiplatform build output + watch-hmr case',
      command: platform === 'wx'
        ? `E2E_PROJECT_FILTER=${name} pnpm e2e:static && E2E_HOT_UPDATE_CASE_NAME=${name} pnpm e2e:hot-update:demo`
        : `E2E_MULTIPLATFORM_BUILD_CASE="${name} ${platform}" pnpm e2e:multiplatform-build`,
    }
    return automated(platform, platform === 'wx' ? { ...base, devScript: 'dev' } : base)
  })
}

function taroPlatforms(name: string, platforms: string[]): DemoPlatformCoverage[] {
  return platforms.map((platform) => {
    const buildScript = platform === 'weapp' ? 'build:weapp' : `build:${platform}`
    const devScript = platform === 'weapp' ? 'dev:weapp' : `dev:${platform}`
    if (platform === 'weapp') {
      return automated(platform, {
        buildScript,
        devScript,
        evidence: 'e2e static project test + watch-hmr case',
        command: `E2E_PROJECT_FILTER=${name} pnpm e2e:static && E2E_HOT_UPDATE_CASE_NAME=${name} pnpm e2e:hot-update:demo`,
      })
    }
    if (platform === 'h5') {
      return automated(platform, {
        buildScript,
        devScript,
        evidence: 'Taro H5 browser source HMR',
        command: `pnpm e2e:taro:web-hmr -t "${taroWebHmrCaseName(name)}"`,
      })
    }
    return local(platform, {
      buildScript,
      devScript,
      evidence: 'multiplatform target matrix',
      command: demoCommand(name, buildScript),
      reason: 'Taro 非 weapp 目标已登记为全平台本地候选；默认 CI 只对稳定目标做专项产物断言。',
      hmrCoverage: 'exempt',
    })
  })
}

function uniAppPlatforms(name: string, platforms: string[]): DemoPlatformCoverage[] {
  return platforms.map((platform) => {
    const buildScript = `build:${platform}`
    const devScript = `dev:${platform}`
    if (platform === 'mp-weixin') {
      return automated(platform, {
        buildScript,
        devScript,
        evidence: 'e2e static project test + watch-hmr case',
        command: `E2E_PROJECT_FILTER=${name} pnpm e2e:static && E2E_HOT_UPDATE_CASE_NAME=${name} pnpm e2e:hot-update:demo`,
      })
    }
    if (platform === 'app') {
      return local(platform, {
        buildScript,
        devScript,
        evidence: 'hbuilderx local App cases',
        command: `E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local:app -t "${name}"`,
        reason: 'App 产物依赖本机 HBuilderX、Android 或 iOS SDK，普通 CI 不默认执行。',
      })
    }
    return automated(platform, {
      buildScript,
      devScript,
      evidence: 'multiplatform build output',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} ${platform}" pnpm e2e:multiplatform-build`,
    })
  })
}

function uniAppHBuilderXPlatforms(name: string): DemoPlatformCoverage[] {
  return [
    local('mp-weixin', {
      buildScript: 'build:mp-weixin',
      devScript: 'dev:mp-weixin',
      evidence: 'multiplatform build output + local-only watch-hmr case',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} mp-weixin" pnpm e2e:multiplatform-build && E2E_HOT_UPDATE_CASE_NAME=${name} pnpm e2e:hot-update:demo`,
      reason: '该 watch case 被标记为 local-only，需通过指定 case 本地运行，不进入默认 demo hot-update 矩阵。',
      staticCoverage: 'automated',
      hmrCoverage: 'local',
    }),
    local('h5', {
      buildScript: 'build:h5',
      devScript: 'dev:h5',
      evidence: 'watch-hmr webHmr case',
      command: `E2E_HOT_UPDATE_CASE_NAME=${name} pnpm e2e:hot-update:demo`,
      reason: 'HBuilderX 形态的 H5 HMR 挂在 local-only watch case 下，默认 CI 不展开执行。',
      staticCoverage: 'automated',
      hmrCoverage: 'local',
    }),
    local('app', {
      buildScript: 'build:app',
      devScript: 'dev:app',
      evidence: 'hbuilderx local App cases',
      command: `E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local:app -t "${name}"`,
      reason: 'App 产物依赖本机 HBuilderX、Android 或 iOS SDK，普通 CI 不默认执行。',
    }),
    local('app-android', {
      devScript: 'dev:android:emulator',
      evidence: 'hbuilderx local Android case',
      command: `E2E_HBUILDERX_LOCAL=1 E2E_HBUILDERX_APP_PLATFORM=app-android pnpm e2e:hbuilderx:local:android -t "${name}"`,
      reason: 'Android 调试依赖本机 HBuilderX 与 Android 模拟器。',
    }),
    local('app-ios', {
      devScript: 'dev:ios:simulator',
      evidence: 'hbuilderx local iOS case',
      command: `E2E_HBUILDERX_LOCAL=1 E2E_HBUILDERX_APP_PLATFORM=app-ios pnpm e2e:hbuilderx:local:ios -t "${name}"`,
      reason: 'iOS 调试依赖 macOS Simulator 与 HBuilderX。',
    }),
  ]
}

function uniAppXPlatforms(name: string): DemoPlatformCoverage[] {
  const isTailwindV4 = name.endsWith('-v4')
  return [
    local('h5', {
      devScript: 'dev:h5',
      evidence: isTailwindV4 ? 'hbuilderx local Web HMR case' : 'package scripts audit',
      command: `pnpm --filter @weapp-tailwindcss-demo/${name} run dev:h5`,
      reason: isTailwindV4
        ? 'uni-app x H5 需要本地浏览器 dev server 验证，默认 CI 不展开执行。'
        : 'Tailwind v3 uni-app x H5 入口路径和 v4 不同，当前只登记可运行脚本。',
      staticCoverage: 'exempt',
      hmrCoverage: isTailwindV4 ? 'local' : 'exempt',
    }),
    ...['mp-weixin', 'app-android', 'app-ios'].map(platform => local(platform, {
      devScript: platform === 'mp-weixin' ? 'dev:mp-weixin' : platform === 'app-android' ? 'dev:android:emulator' : 'dev:ios:simulator',
      evidence: 'hbuilderx local cases',
      command: platform === 'mp-weixin'
        ? `E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local:mp -t "${name}"`
        : `E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local:${platform === 'app-android' ? 'android' : 'ios'} -t "${name}"`,
      reason: 'uni-app x 产物依赖本机 HBuilderX 与微信/Android/iOS SDK，普通 CI 不默认执行。',
    })),
  ]
}

function weappVitePlatforms(name: string): DemoPlatformCoverage[] {
  return [automated('weapp', {
    buildScript: 'build',
    devScript: 'dev',
    evidence: 'e2e static project test + watch-hmr case',
    command: `E2E_PROJECT_FILTER=${name} pnpm e2e:static && E2E_HOT_UPDATE_CASE_NAME=${name} pnpm e2e:hot-update:demo`,
  })]
}

function webPlatforms(name: string): DemoPlatformCoverage[] {
  const hmrName = name
    .replace('web/react-vite-tailwindcss-v', 'web react vite Tailwind v')
    .replace('web/vue-vite-tailwindcss-v', 'web vue vite Tailwind v')
  return [
    automated('web', {
      buildScript: 'build:web',
      devScript: 'dev',
      evidence: 'demo/web Vite source HMR',
      command: `pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/web-vite-demo-hmr.test.ts -t "${hmrName}"`,
    }),
    local('weapp', {
      buildScript: 'build:weapp',
      devScript: 'dev:weapp',
      evidence: 'demo:web:compare',
      command: 'pnpm demo:web:compare',
      reason: 'Web demo 的 weapp 目标通过专项对比脚本验收，不属于小程序 IDE 静态快照矩阵。',
      hmrCoverage: 'exempt',
    }),
  ]
}

export const DEMO_COVERAGE_MATRIX = [
  entry({ name: 'gulp-tailwindcss-v3', packageJson: pkg('gulp-tailwindcss-v3'), framework: 'gulp', builder: 'gulp', tailwindcss: 'v3', sourceShape: 'native', sfcBlocks: [], hbuilderxLocal: false, platforms: gulpPlatforms('gulp-tailwindcss-v3') }),
  entry({ name: 'gulp-tailwindcss-v4', packageJson: pkg('gulp-tailwindcss-v4'), framework: 'gulp', builder: 'gulp', tailwindcss: 'v4', sourceShape: 'native', sfcBlocks: [], hbuilderxLocal: false, platforms: gulpPlatforms('gulp-tailwindcss-v4') }),
  entry({ name: 'mpx-tailwindcss-v3', packageJson: pkg('mpx-tailwindcss-v3'), framework: 'mpx', builder: 'webpack5', tailwindcss: 'v3', sourceShape: 'mpx-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: mpxPlatforms('mpx-tailwindcss-v3') }),
  entry({ name: 'mpx-tailwindcss-v4', packageJson: pkg('mpx-tailwindcss-v4'), framework: 'mpx', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'mpx-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: mpxPlatforms('mpx-tailwindcss-v4') }),
  entry({ name: 'taro-vite-react-tailwindcss-v3', packageJson: pkg('taro-vite-react-tailwindcss-v3'), framework: 'taro-react', builder: 'vite', tailwindcss: 'v3', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: taroPlatforms('taro-vite-react-tailwindcss-v3', taroVitePlatforms) }),
  entry({ name: 'taro-vite-react-tailwindcss-v4', packageJson: pkg('taro-vite-react-tailwindcss-v4'), framework: 'taro-react', builder: 'vite', tailwindcss: 'v4', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: taroPlatforms('taro-vite-react-tailwindcss-v4', taroVitePlatforms) }),
  entry({ name: 'taro-vite-vue3-tailwindcss-v3', packageJson: pkg('taro-vite-vue3-tailwindcss-v3'), framework: 'taro-vue3', builder: 'vite', tailwindcss: 'v3', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: taroPlatforms('taro-vite-vue3-tailwindcss-v3', taroVitePlatforms) }),
  entry({ name: 'taro-vite-vue3-tailwindcss-v4', packageJson: pkg('taro-vite-vue3-tailwindcss-v4'), framework: 'taro-vue3', builder: 'vite', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: taroPlatforms('taro-vite-vue3-tailwindcss-v4', taroVitePlatforms) }),
  entry({ name: 'taro-webpack-react-tailwindcss-v3', packageJson: pkg('taro-webpack-react-tailwindcss-v3'), framework: 'taro-react', builder: 'webpack5', tailwindcss: 'v3', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: taroPlatforms('taro-webpack-react-tailwindcss-v3', taroWebpackV3Platforms) }),
  entry({ name: 'taro-webpack-react-tailwindcss-v4', packageJson: pkg('taro-webpack-react-tailwindcss-v4'), framework: 'taro-react', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: taroPlatforms('taro-webpack-react-tailwindcss-v4', taroWebpackV4Platforms) }),
  entry({ name: 'taro-webpack-vue3-tailwindcss-v3', packageJson: pkg('taro-webpack-vue3-tailwindcss-v3'), framework: 'taro-vue3', builder: 'webpack5', tailwindcss: 'v3', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: taroPlatforms('taro-webpack-vue3-tailwindcss-v3', taroWebpackV3Platforms) }),
  entry({ name: 'taro-webpack-vue3-tailwindcss-v4', packageJson: pkg('taro-webpack-vue3-tailwindcss-v4'), framework: 'taro-vue3', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: taroPlatforms('taro-webpack-vue3-tailwindcss-v4', taroWebpackV4Platforms) }),
  entry({ name: 'uni-app-vite-tailwindcss-v3', packageJson: pkg('uni-app-vite-tailwindcss-v3'), framework: 'uni-app', builder: 'vite', tailwindcss: 'v3', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: uniAppPlatforms('uni-app-vite-tailwindcss-v3', uniAppV3Platforms) }),
  entry({ name: 'uni-app-vite-tailwindcss-v4', packageJson: pkg('uni-app-vite-tailwindcss-v4'), framework: 'uni-app', builder: 'vite', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: uniAppPlatforms('uni-app-vite-tailwindcss-v4', uniAppV4Platforms) }),
  entry({ name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3', packageJson: pkg('uni-app-vite-vue3-hbuilderx-tailwindcss-v3'), framework: 'uni-app', builder: 'vite-hbuilderx', tailwindcss: 'v3', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: true, platforms: uniAppHBuilderXPlatforms('uni-app-vite-vue3-hbuilderx-tailwindcss-v3') }),
  entry({ name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4', packageJson: pkg('uni-app-vite-vue3-hbuilderx-tailwindcss-v4'), framework: 'uni-app', builder: 'vite-hbuilderx', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: true, platforms: uniAppHBuilderXPlatforms('uni-app-vite-vue3-hbuilderx-tailwindcss-v4') }),
  entry({ name: 'uni-app-x-hbuilderx-tailwindcss-v3', packageJson: pkg('uni-app-x-hbuilderx-tailwindcss-v3'), framework: 'uni-app-x', builder: 'hbuilderx', tailwindcss: 'v3', sourceShape: 'uvue', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: true, platforms: uniAppXPlatforms('uni-app-x-hbuilderx-tailwindcss-v3') }),
  entry({ name: 'uni-app-x-hbuilderx-tailwindcss-v4', packageJson: pkg('uni-app-x-hbuilderx-tailwindcss-v4'), framework: 'uni-app-x', builder: 'hbuilderx', tailwindcss: 'v4', sourceShape: 'uvue', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: true, platforms: uniAppXPlatforms('uni-app-x-hbuilderx-tailwindcss-v4') }),
  entry({ name: 'weapp-vite-tailwindcss-v3', packageJson: pkg('weapp-vite-tailwindcss-v3'), framework: 'weapp-vite', builder: 'vite', tailwindcss: 'v3', sourceShape: 'native', sfcBlocks: [], hbuilderxLocal: false, platforms: weappVitePlatforms('weapp-vite-tailwindcss-v3') }),
  entry({ name: 'weapp-vite-tailwindcss-v4', packageJson: pkg('weapp-vite-tailwindcss-v4'), framework: 'weapp-vite', builder: 'vite', tailwindcss: 'v4', sourceShape: 'native', sfcBlocks: [], hbuilderxLocal: false, platforms: weappVitePlatforms('weapp-vite-tailwindcss-v4') }),
  entry({ name: 'web/react-vite-tailwindcss-v3', packageJson: pkg('web/react-vite-tailwindcss-v3'), framework: 'web-vite-react', builder: 'vite', tailwindcss: 'v3', sourceShape: 'web-tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: webPlatforms('web/react-vite-tailwindcss-v3') }),
  entry({ name: 'web/react-vite-tailwindcss-v4', packageJson: pkg('web/react-vite-tailwindcss-v4'), framework: 'web-vite-react', builder: 'vite', tailwindcss: 'v4', sourceShape: 'web-tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: webPlatforms('web/react-vite-tailwindcss-v4') }),
  entry({ name: 'web/vue-vite-tailwindcss-v3', packageJson: pkg('web/vue-vite-tailwindcss-v3'), framework: 'web-vite-vue', builder: 'vite', tailwindcss: 'v3', sourceShape: 'web-vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: webPlatforms('web/vue-vite-tailwindcss-v3') }),
  entry({ name: 'web/vue-vite-tailwindcss-v4', packageJson: pkg('web/vue-vite-tailwindcss-v4'), framework: 'web-vite-vue', builder: 'vite', tailwindcss: 'v4', sourceShape: 'web-vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: webPlatforms('web/vue-vite-tailwindcss-v4') }),
] satisfies DemoCoverageEntry[]

export function getAutomatedHotUpdateDemoNames() {
  return DEMO_COVERAGE_MATRIX
    .filter(entry => entry.platforms.some(platform => platform.hmrCoverage === 'automated'))
    .filter(entry => !entry.name.startsWith('web/'))
    .map(entry => entry.name)
    .sort()
}

export function getAutomatedThreeBlockHotUpdateDemoNames() {
  return DEMO_COVERAGE_MATRIX
    .filter(entry => entry.sfcBlocks.join('/') === 'template/script/style')
    .filter(entry => entry.platforms.some(platform => platform.hmrCoverage === 'automated'))
    .filter(entry => !entry.name.startsWith('web/'))
    .map(entry => entry.name)
    .sort()
}

export function getDefaultHotUpdateDemoNames() {
  return [...HOT_UPDATE_CI_CASES].sort()
}

export function discoverDemoPackageNames() {
  const demoRoot = path.resolve(repoRoot, 'demo')
  const names: string[] = []

  for (const dirent of fs.readdirSync(demoRoot, { withFileTypes: true })) {
    if (!dirent.isDirectory()) {
      continue
    }
    const rootPkg = path.join(demoRoot, dirent.name, 'package.json')
    if (fs.existsSync(rootPkg)) {
      names.push(dirent.name)
    }
  }

  const webRoot = path.join(demoRoot, 'web')
  for (const dirent of fs.readdirSync(webRoot, { withFileTypes: true })) {
    if (!dirent.isDirectory()) {
      continue
    }
    const webPkg = path.join(webRoot, dirent.name, 'package.json')
    if (fs.existsSync(webPkg)) {
      names.push(`web/${dirent.name}`)
    }
  }

  return names.sort()
}
