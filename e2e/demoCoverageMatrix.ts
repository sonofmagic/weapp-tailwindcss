import fs from 'node:fs'
import path from 'pathe'
import { HOT_UPDATE_CI_CASES } from './e2eMatrix'

export type DemoFramework
  = | 'gulp'
    | 'mpx'
    | 'style-injector'
    | 'taro-react'
    | 'taro-vue3'
    | 'uni-app'
    | 'uni-app-x'
    | 'weapp-vite'
    | 'web-rsbuild-react'
    | 'web-rsbuild-vue'
    | 'web-vite-react'
    | 'web-vite-vue'
    | 'web-vite-nuxt'
    | 'web-webpack-react'
    | 'web-webpack-vue'

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
const taroWebpackV4Platforms = ['weapp', 'swan', 'alipay', 'tt', 'h5', 'rn', 'qq', 'jd', 'harmony-hybrid']
const subpackageTaroWebpackV4Platforms = ['weapp', 'alipay', 'tt', 'h5', 'rn', 'android', 'ios']
const uniAppV4Platforms = ['app-android', 'app-ios', 'h5', 'h5:ssr', 'mp-alipay', 'mp-baidu', 'mp-jd', 'mp-kuaishou', 'mp-lark', 'mp-qq', 'mp-toutiao', 'mp-weixin', 'mp-xhs', 'quickapp-webview', 'quickapp-webview-huawei', 'quickapp-webview-union']
const subpackageUniAppV4Platforms = ['app-android', 'app-ios', 'h5', 'h5:ssr', 'mp-alipay', 'mp-toutiao', 'mp-weixin']

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

function subpackageTaroWebpackPlatforms(name: string): DemoPlatformCoverage[] {
  return subpackageTaroWebpackV4Platforms.map((platform) => {
    const buildScript = platform === 'weapp' ? 'build:weapp' : `build:${platform}`
    const devScript = platform === 'weapp' ? 'dev:weapp' : `dev:${platform}`
    if (platform === 'alipay' || platform === 'tt' || platform === 'h5') {
      return local(platform, {
        buildScript,
        devScript,
        evidence: 'multiplatform build output',
        command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} ${platform}" pnpm e2e:multiplatform-build`,
        reason: '该 subpackage 专项 demo 默认验证构建产物隔离，不纳入 IDE/HMR 长链路。',
        staticCoverage: 'automated',
        hmrCoverage: 'exempt',
      })
    }
    return local(platform, {
      buildScript,
      devScript,
      evidence: 'multiplatform target matrix',
      command: demoCommand(name, buildScript),
      reason: platform === 'android' || platform === 'ios' || platform === 'rn'
        ? 'Taro RN/Android/iOS 依赖本地 RN SDK、模拟器或原生环境，默认 CI 不执行。'
        : '该 subpackage 专项 demo 默认验证 alipay/tt/h5 构建产物，其他目标登记为本地候选。',
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
    if (platform === 'app-android' || platform === 'app-ios') {
      return local(platform, {
        buildScript: 'build:app',
        devScript: 'dev:app',
        evidence: platform === 'app-android' ? 'hbuilderx local Android case' : 'hbuilderx local iOS case',
        command: `E2E_HBUILDERX_LOCAL=1 E2E_HBUILDERX_APP_PLATFORM=${platform} pnpm e2e:hbuilderx:local:${platform === 'app-android' ? 'android' : 'ios'} -t "${name}"`,
        reason: platform === 'app-android'
          ? 'Android 调试依赖本机 HBuilderX 与 Android 模拟器。'
          : 'iOS 调试依赖 macOS Simulator 与 HBuilderX。',
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

function subpackageUniAppPlatforms(name: string): DemoPlatformCoverage[] {
  return subpackageUniAppV4Platforms.map((platform) => {
    const buildScript = `build:${platform}`
    const devScript = `dev:${platform}`
    if (platform === 'app-android' || platform === 'app-ios') {
      return local(platform, {
        buildScript: 'build:app',
        devScript: 'dev:app',
        evidence: platform === 'app-android' ? 'documented App Android local target' : 'documented App iOS local target',
        command: `E2E_HBUILDERX_LOCAL=1 E2E_HBUILDERX_APP_PLATFORM=${platform} pnpm e2e:hbuilderx:local:${platform === 'app-android' ? 'android' : 'ios'} -t "${name}"`,
        reason: platform === 'app-android'
          ? 'Android 调试依赖本机 HBuilderX 与 Android 模拟器。'
          : 'iOS 调试依赖 macOS Simulator 与 HBuilderX。',
        hmrCoverage: 'exempt',
      })
    }
    return local(platform, {
      buildScript,
      devScript,
      evidence: 'multiplatform build output',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} ${platform}" pnpm e2e:multiplatform-build`,
      reason: '该 subpackage 专项 demo 默认验证构建产物隔离，不纳入 IDE/HMR 长链路。',
      staticCoverage: 'automated',
      hmrCoverage: 'exempt',
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
    ...(['mp-alipay', 'mp-baidu', 'mp-toutiao'] as const).map(platform => local(platform, {
      evidence: 'hbuilderx local non-WeChat mini-program case',
      command: `E2E_HBUILDERX_LOCAL=1 E2E_HBUILDERX_MP_PLATFORM=${platform} pnpm e2e:hbuilderx:local:demo:${platform} -t "${name}"`,
      reason: 'HBuilderX 非微信小程序编译依赖本机 IDE，已登记为本地回归 case，不进入普通 CI。',
      staticCoverage: 'local',
      hmrCoverage: 'exempt',
    })),
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
  function uniAppXDevScript(platform: string) {
    if (platform === 'mp-weixin') {
      return 'dev:mp-weixin'
    }
    if (platform === 'app-android') {
      return 'dev:android:emulator'
    }
    if (platform === 'app-ios') {
      return 'dev:ios:simulator'
    }
  }

  return [
    local('h5', {
      devScript: 'dev:h5',
      evidence: 'hbuilderx local Web HMR case',
      command: `E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local:web -t "${name}"`,
      reason: 'uni-app x H5 需要本地浏览器 dev server 验证，默认 CI 不展开执行。',
      staticCoverage: 'exempt',
      hmrCoverage: 'local',
    }),
    ...['mp-weixin', 'app-android', 'app-ios', 'app-harmony'].map(platform => local(platform, {
      ...(uniAppXDevScript(platform) ? { devScript: uniAppXDevScript(platform) } : {}),
      evidence: 'hbuilderx local cases',
      command: platform === 'mp-weixin'
        ? `E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local:mp -t "${name}"`
        : `E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local:${platform === 'app-android' ? 'android' : platform === 'app-ios' ? 'ios' : 'harmony'} -t "${name}"`,
      reason: 'uni-app x 产物依赖本机 HBuilderX 与微信/Android/iOS/Harmony SDK，普通 CI 不默认执行。',
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
    .replace('web/', 'web ')
    .replaceAll('-', ' ')
    .replace('tailwindcss v', 'Tailwind v')
  return [
    automated('web', {
      buildScript: 'build:web',
      devScript: 'dev',
      evidence: 'demo/web browser source HMR',
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

function webOnlyPlatforms(name: string): DemoPlatformCoverage[] {
  const hmrName = name
    .replace('web/', 'web ')
    .replaceAll('-', ' ')
    .replace('tailwindcss v', 'Tailwind v')
  return [
    automated('web', {
      buildScript: 'build',
      devScript: 'dev',
      evidence: 'demo/web browser source HMR',
      command: `pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/web-vite-demo-hmr.test.ts -t "${hmrName}"`,
    }),
  ]
}

function styleInjectorMpxPlatforms(name: string): DemoPlatformCoverage[] {
  return [
    local('wx', {
      buildScript: 'build',
      devScript: 'dev',
      evidence: 'style-injector multiplatform build output',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} wx" pnpm e2e:multiplatform-build`,
      reason: 'style-injector demo 验证样式注入器产物，不属于 Tailwind source HMR 长链路。',
      staticCoverage: 'automated',
      hmrCoverage: 'exempt',
    }),
  ]
}

function styleInjectorTaroPlatforms(name: string): DemoPlatformCoverage[] {
  return [
    local('weapp', {
      buildScript: 'build:weapp',
      devScript: 'dev:weapp',
      evidence: 'style-injector multiplatform build output',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} weapp" pnpm e2e:multiplatform-build`,
      reason: 'style-injector demo 验证样式注入器产物，不属于 Tailwind source HMR 长链路。',
      staticCoverage: 'automated',
      hmrCoverage: 'exempt',
    }),
    local('h5', {
      buildScript: 'build:h5',
      devScript: 'dev:h5',
      evidence: 'style-injector H5 build output',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} h5" pnpm e2e:multiplatform-build`,
      reason: 'style-injector H5 demo 验证样式注入器产物，不属于 Tailwind source HMR 长链路。',
      staticCoverage: 'automated',
      hmrCoverage: 'exempt',
    }),
  ]
}

function styleInjectorUniAppPlatforms(name: string): DemoPlatformCoverage[] {
  return [
    local('mp-weixin', {
      buildScript: 'build:mp-weixin',
      devScript: 'dev:mp-weixin',
      evidence: 'style-injector multiplatform build output',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} mp-weixin" pnpm e2e:multiplatform-build`,
      reason: 'style-injector uni-app demo 验证样式注入器产物，不属于 Tailwind source HMR 长链路。',
      staticCoverage: 'automated',
      hmrCoverage: 'exempt',
    }),
    local('h5', {
      buildScript: 'build:h5',
      devScript: 'dev:h5',
      evidence: 'style-injector H5 build output',
      command: `E2E_MULTIPLATFORM_BUILD_CASE="${name} h5" pnpm e2e:multiplatform-build`,
      reason: 'style-injector uni-app H5 demo 验证样式注入器产物，不属于 Tailwind source HMR 长链路。',
      staticCoverage: 'automated',
      hmrCoverage: 'exempt',
    }),
  ]
}

export const DEMO_COVERAGE_MATRIX = [
  entry({ name: 'gulp-tailwindcss-v4', packageJson: pkg('gulp-tailwindcss-v4'), framework: 'gulp', builder: 'gulp', tailwindcss: 'v4', sourceShape: 'native', sfcBlocks: [], hbuilderxLocal: false, platforms: gulpPlatforms('gulp-tailwindcss-v4') }),
  entry({ name: 'mpx-tailwindcss-v4', packageJson: pkg('mpx-tailwindcss-v4'), framework: 'mpx', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'mpx-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: mpxPlatforms('mpx-tailwindcss-v4') }),
  entry({ name: 'taro-vite-react-tailwindcss-v4', packageJson: pkg('taro-vite-react-tailwindcss-v4'), framework: 'taro-react', builder: 'vite', tailwindcss: 'v4', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: taroPlatforms('taro-vite-react-tailwindcss-v4', taroVitePlatforms) }),
  entry({ name: 'taro-vite-vue3-tailwindcss-v4', packageJson: pkg('taro-vite-vue3-tailwindcss-v4'), framework: 'taro-vue3', builder: 'vite', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: taroPlatforms('taro-vite-vue3-tailwindcss-v4', taroVitePlatforms) }),
  entry({ name: 'taro-webpack-react-tailwindcss-v4', packageJson: pkg('taro-webpack-react-tailwindcss-v4'), framework: 'taro-react', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: taroPlatforms('taro-webpack-react-tailwindcss-v4', taroWebpackV4Platforms) }),
  entry({ name: 'subpackage-taro-webpack-react-tailwindcss-v4', packageJson: pkg('subpackage-taro-webpack-react-tailwindcss-v4'), framework: 'taro-react', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: subpackageTaroWebpackPlatforms('subpackage-taro-webpack-react-tailwindcss-v4') }),
  entry({ name: 'taro-webpack-vue3-tailwindcss-v4', packageJson: pkg('taro-webpack-vue3-tailwindcss-v4'), framework: 'taro-vue3', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: taroPlatforms('taro-webpack-vue3-tailwindcss-v4', taroWebpackV4Platforms) }),
  entry({ name: 'uni-app-vite-tailwindcss-v4', packageJson: pkg('uni-app-vite-tailwindcss-v4'), framework: 'uni-app', builder: 'vite', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: uniAppPlatforms('uni-app-vite-tailwindcss-v4', uniAppV4Platforms) }),
  entry({ name: 'subpackage-uni-app-vite-tailwindcss-v4', packageJson: pkg('subpackage-uni-app-vite-tailwindcss-v4'), framework: 'uni-app', builder: 'vite', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: subpackageUniAppPlatforms('subpackage-uni-app-vite-tailwindcss-v4') }),
  entry({ name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4', packageJson: pkg('uni-app-vite-vue3-hbuilderx-tailwindcss-v4'), framework: 'uni-app', builder: 'vite-hbuilderx', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: true, platforms: uniAppHBuilderXPlatforms('uni-app-vite-vue3-hbuilderx-tailwindcss-v4') }),
  entry({ name: 'uni-app-x-hbuilderx-tailwindcss-v4', packageJson: pkg('uni-app-x-hbuilderx-tailwindcss-v4'), framework: 'uni-app-x', builder: 'hbuilderx', tailwindcss: 'v4', sourceShape: 'uvue', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: true, platforms: uniAppXPlatforms('uni-app-x-hbuilderx-tailwindcss-v4') }),
  entry({ name: 'weapp-vite-tailwindcss-v4', packageJson: pkg('weapp-vite-tailwindcss-v4'), framework: 'weapp-vite', builder: 'vite', tailwindcss: 'v4', sourceShape: 'native', sfcBlocks: [], hbuilderxLocal: false, platforms: weappVitePlatforms('weapp-vite-tailwindcss-v4') }),
  entry({ name: 'web/react-vite-tailwindcss-v4', packageJson: pkg('web/react-vite-tailwindcss-v4'), framework: 'web-vite-react', builder: 'vite', tailwindcss: 'v4', sourceShape: 'web-tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: webPlatforms('web/react-vite-tailwindcss-v4') }),
  entry({ name: 'web/vue-vite-tailwindcss-v4', packageJson: pkg('web/vue-vite-tailwindcss-v4'), framework: 'web-vite-vue', builder: 'vite', tailwindcss: 'v4', sourceShape: 'web-vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: webPlatforms('web/vue-vite-tailwindcss-v4') }),
  entry({ name: 'web/vue-vite7-tailwindcss-v4', packageJson: pkg('web/vue-vite7-tailwindcss-v4'), framework: 'web-vite-vue', builder: 'vite7', tailwindcss: 'v4', sourceShape: 'web-vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: webOnlyPlatforms('web/vue-vite7-tailwindcss-v4') }),
  entry({ name: 'web/nuxt-vite-tailwindcss-v4', packageJson: pkg('web/nuxt-vite-tailwindcss-v4'), framework: 'web-vite-nuxt', builder: 'nuxt-vite', tailwindcss: 'v4', sourceShape: 'web-vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: webOnlyPlatforms('web/nuxt-vite-tailwindcss-v4') }),
  entry({ name: 'web/react-rsbuild-tailwindcss-v4', packageJson: pkg('web/react-rsbuild-tailwindcss-v4'), framework: 'web-rsbuild-react', builder: 'rsbuild', tailwindcss: 'v4', sourceShape: 'web-tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: webPlatforms('web/react-rsbuild-tailwindcss-v4') }),
  entry({ name: 'web/vue-rsbuild-tailwindcss-v4', packageJson: pkg('web/vue-rsbuild-tailwindcss-v4'), framework: 'web-rsbuild-vue', builder: 'rsbuild', tailwindcss: 'v4', sourceShape: 'web-vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: webPlatforms('web/vue-rsbuild-tailwindcss-v4') }),
  entry({ name: 'web/react-webpack-tailwindcss-v4', packageJson: pkg('web/react-webpack-tailwindcss-v4'), framework: 'web-webpack-react', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'web-tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: webPlatforms('web/react-webpack-tailwindcss-v4') }),
  entry({ name: 'web/vue-webpack-tailwindcss-v4', packageJson: pkg('web/vue-webpack-tailwindcss-v4'), framework: 'web-webpack-vue', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'web-vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: webPlatforms('web/vue-webpack-tailwindcss-v4') }),
  entry({ name: 'style-injector-mpx', packageJson: pkg('style-injector-mpx'), framework: 'style-injector', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'mpx-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: styleInjectorMpxPlatforms('style-injector-mpx') }),
  entry({ name: 'style-injector-taro-vite-react', packageJson: pkg('style-injector-taro-vite-react'), framework: 'style-injector', builder: 'vite', tailwindcss: 'v4', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: styleInjectorTaroPlatforms('style-injector-taro-vite-react') }),
  entry({ name: 'style-injector-taro-webpack-react', packageJson: pkg('style-injector-taro-webpack-react'), framework: 'style-injector', builder: 'webpack5', tailwindcss: 'v4', sourceShape: 'tsx', sfcBlocks: [], hbuilderxLocal: false, platforms: styleInjectorTaroPlatforms('style-injector-taro-webpack-react') }),
  entry({ name: 'style-injector-uni-app', packageJson: pkg('style-injector-uni-app'), framework: 'style-injector', builder: 'vite', tailwindcss: 'v4', sourceShape: 'vue-sfc', sfcBlocks: ['template', 'script', 'style'], hbuilderxLocal: false, platforms: styleInjectorUniAppPlatforms('style-injector-uni-app') }),
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
      if (dirent.name.startsWith('issue-')) {
        continue
      }
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
