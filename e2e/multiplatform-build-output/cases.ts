import process from 'node:process'

export type BuildOutputCaseStatus = 'ci' | 'local'

export interface BuildOutputCase {
  name: string
  framework: 'uni-app' | 'uni-app-x' | 'taro' | 'mpx'
  projectDir: string
  platform: string
  command: string[]
  commandCwd?: 'project' | 'repo'
  outputDir: string
  requiredFiles: string[]
  styleFiles: string[]
  textFiles?: string[]
  styleContains: Array<string | RegExp>
  textContains?: Array<string | RegExp>
  notContains?: Array<string | RegExp>
  env?: Record<string, string>
  status: BuildOutputCaseStatus
  reason?: string
}

const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/

function uniAppCase(options: {
  project: string
  version: 'v3' | 'v4'
  platform: 'mp-alipay' | 'mp-qq' | 'mp-toutiao' | 'mp-baidu' | 'quickapp-webview'
  cssFile: string
  styleContains: Array<string | RegExp>
  requiredFiles?: string[]
  textFiles?: string[]
  textContains?: Array<string | RegExp>
}): BuildOutputCase {
  const outputDir = `dist/build/${options.platform}`
  return {
    name: `${options.project} ${options.platform}`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', 'run', `build:${options.platform}`],
    outputDir,
    requiredFiles: options.requiredFiles ?? [
      `${outputDir}/app.js`,
      `${outputDir}/app.json`,
      `${outputDir}/${options.cssFile}`,
    ],
    styleFiles: [`${outputDir}/${options.cssFile}`],
    textFiles: options.textFiles,
    styleContains: options.styleContains,
    textContains: options.textContains,
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

function mpxCase(options: {
  project: string
  version: 'v3' | 'v4'
  platform: 'ali' | 'swan' | 'tt'
  command: string[]
  env?: Record<string, string>
}): BuildOutputCase {
  return {
    name: `${options.project} ${options.platform}`,
    framework: 'mpx',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: options.command,
    env: options.env,
    outputDir: 'dist/wx',
    requiredFiles: [
      'dist/wx/app.js',
      'dist/wx/app.json',
      'dist/wx/pages/index.wxml',
    ],
    styleFiles: ['dist/wx/styles'],
    textFiles: ['dist/wx/pages/index.wxml'],
    styleContains: options.version === 'v4'
      ? [
          '.bg-_b_h123456_B',
          '.w-_b300rpx_B',
          '.text-_b_hbada55_B',
          '.before_ccontent',
        ]
      : [
          '.bg-_b_h123456_B',
          '.bg-_burl',
          '.before_ccontent',
        ],
    textContains: options.version === 'v4'
      ? [
          'bg-_b_h123456_B',
          'text-_b_hbada55_B',
        ]
      : [
          'classNames',
          'bgUrl',
        ],
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

function taroH5Case(options: {
  project: string
  version: 'v3' | 'v4'
  status: BuildOutputCaseStatus
  reason?: string
}): BuildOutputCase {
  return {
    name: `${options.project} h5`,
    framework: 'taro',
    projectDir: `demo/${options.project}`,
    platform: 'h5',
    command: ['pnpm', 'run', 'build:h5'],
    outputDir: 'dist',
    requiredFiles: ['dist/index.html'],
    styleFiles: ['dist/css'],
    textFiles: ['dist/index.html'],
    styleContains: options.version === 'v4'
      ? ['.bg-linear-to-r', 'linear-gradient']
      : ['.taro_page', 'box-sizing'],
    textContains: ['<html'],
    notContains: [rawTailwindDirectiveRE],
    status: options.status,
    reason: options.reason,
  }
}

function taroMiniCase(options: {
  project: string
  packageName: string
  platform: 'alipay'
  cssFile: string
  requiredFiles: string[]
  styleContains: Array<string | RegExp>
  textFiles?: string[]
  textContains?: Array<string | RegExp>
  status?: BuildOutputCaseStatus
  reason?: string
}): BuildOutputCase {
  return {
    name: `${options.project} ${options.platform}`,
    framework: 'taro',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', '--filter', options.packageName, 'run', `build:${options.platform}`],
    commandCwd: 'repo',
    outputDir: 'dist',
    requiredFiles: options.requiredFiles,
    styleFiles: [options.cssFile],
    textFiles: options.textFiles,
    styleContains: options.styleContains,
    textContains: options.textContains,
    notContains: [rawTailwindDirectiveRE],
    status: options.status ?? 'ci',
    reason: options.reason,
  }
}

function uniAppXAppCase(options: {
  version: 'v3' | 'v4'
  platform: 'app-android' | 'app-ios'
  requiredFiles: string[]
  styleFiles: string[]
  transformedContains: Array<string | RegExp>
}): BuildOutputCase {
  const project = `uni-app-x-hbuilderx-tailwindcss-${options.version}`
  return {
    name: `${project} ${options.platform}`,
    framework: 'uni-app-x',
    projectDir: `demo/${project}`,
    platform: options.platform,
    command: ['hbuilderx', 'launch', options.platform, '--project', '.', '--compile', 'true'],
    outputDir: `unpackage/dist/dev/${options.platform}`,
    requiredFiles: options.requiredFiles,
    styleFiles: options.styleFiles,
    styleContains: options.transformedContains,
    status: 'local',
    reason: 'uni-app x App 产物依赖本地 HBuilderX 与 Android/iOS SDK，CI 不默认执行；运行 pnpm e2e:hbuilderx:local:android 或 pnpm e2e:hbuilderx:local:ios 验证。',
  }
}

export const MULTIPLATFORM_BUILD_OUTPUT_CASES: BuildOutputCase[] = [
  uniAppCase({
    project: 'uni-app-vite-tailwindcss-v3',
    version: 'v3',
    platform: 'mp-alipay',
    cssFile: 'app.acss',
    styleContains: ['.bg-_b_h123456_B', '.i-mdi-home', '.before_ccontent'],
    textFiles: ['dist/build/mp-alipay/pages/index/index.axml'],
    textContains: ['bg-_b_h123456_B'],
  }),
  uniAppCase({
    project: 'uni-app-vite-tailwindcss-v3',
    version: 'v3',
    platform: 'mp-qq',
    cssFile: 'app.qss',
    styleContains: ['.bg-_b_h123456_B', '.i-mdi-home', '.before_ccontent'],
  }),
  uniAppCase({
    project: 'uni-app-vite-tailwindcss-v4',
    version: 'v4',
    platform: 'mp-alipay',
    cssFile: 'app.acss',
    styleContains: ['.bg-_b_h0000ff_B', '.i-mdi-home', '.before_ccontent'],
    textFiles: ['dist/build/mp-alipay/pages/index/index.js'],
    textContains: ['bg-_b_h0000ff_B'],
  }),
  uniAppCase({
    project: 'uni-app-vite-tailwindcss-v4',
    version: 'v4',
    platform: 'mp-qq',
    cssFile: 'app.qss',
    styleContains: ['.bg-_b_h0000ff_B', '.i-mdi-home', '.before_ccontent'],
  }),
  mpxCase({
    project: 'mpx-tailwindcss-v3',
    version: 'v3',
    platform: 'ali',
    command: ['pnpm', 'run', 'build', '--', '--mode', 'ali'],
    env: {
      MPX_CURRENT_TARGET_MODE: 'ali',
    },
  }),
  mpxCase({
    project: 'mpx-tailwindcss-v4',
    version: 'v4',
    platform: 'ali',
    command: ['pnpm', 'exec', 'mpx-cli-service', 'build', '--mode', 'ali'],
    env: {
      MPX_CURRENT_TARGET_MODE: 'ali',
    },
  }),
  mpxCase({
    project: 'mpx-tailwindcss-v4',
    version: 'v4',
    platform: 'swan',
    command: ['pnpm', 'exec', 'mpx-cli-service', 'build', '--mode', 'swan'],
    env: {
      MPX_CURRENT_TARGET_MODE: 'swan',
    },
  }),
  taroMiniCase({
    project: 'taro-webpack-react-tailwindcss-v4',
    packageName: '@weapp-tailwindcss-demo/taro-webpack-react-tailwindcss-v4',
    platform: 'alipay',
    cssFile: 'dist/app.acss',
    requiredFiles: [
      'dist/app.js',
      'dist/app.json',
      'dist/app.acss',
      'dist/pages/index/index.axml',
    ],
    styleContains: ['.bg-_b_h534312_B', '.text-_b_hfff_B', '.before_ccontent'],
    textFiles: ['dist/pages/index/index.js'],
    textContains: ['bg-_b_h534312_B', 'text-_b_hfff_B'],
    status: 'local',
    reason: 'Taro Webpack v4 Alipay 通过 pnpm e2e:multiplatform-build:taro-alipay 在 CI 中先构建再只读断言；当前不放入默认 vitest/execa 构建集合，避免触发底层 system-configuration panic 并卡住。',
  }),
  taroMiniCase({
    project: 'taro-vite-react-tailwindcss-v3',
    packageName: '@weapp-tailwindcss-demo/taro-vite-react-tailwindcss-v3',
    platform: 'alipay',
    cssFile: 'dist/app.acss',
    requiredFiles: ['dist/app.js', 'dist/app.json', 'dist/app.acss'],
    styleContains: [],
    status: 'local',
    reason: '当前 Taro Vite mini 非 weapp 目标在 vite-runner emit 阶段读取 chunk.type 失败，暂不纳入 CI。',
  }),
  taroH5Case({
    project: 'taro-vite-react-tailwindcss-v3',
    version: 'v3',
    status: 'local',
    reason: '当前 H5 产物仍会保留分包 CSS 的原始 Tailwind 指令，先作为非 CI 候选保留。',
  }),
  taroH5Case({
    project: 'taro-vite-react-tailwindcss-v4',
    version: 'v4',
    status: 'local',
    reason: '当前 Taro v4 H5 legacy post-process 会读取 development browserslist，先作为非 CI 候选保留。',
  }),
  uniAppXAppCase({
    version: 'v3',
    platform: 'app-android',
    requiredFiles: [
      'unpackage/dist/dev/app-android/manifest.json',
      'unpackage/dist/dev/app-android/pages/index/index/classes.dex',
    ],
    styleFiles: ['unpackage/dist/dev/.uvue/app-android/pages/index/index.uvue'],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B'],
  }),
  uniAppXAppCase({
    version: 'v3',
    platform: 'app-ios',
    requiredFiles: ['unpackage/dist/dev/app-ios/manifest.json'],
    styleFiles: ['unpackage/cache/.app-ios/sourcemap/app-service.js.map'],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B'],
  }),
  uniAppXAppCase({
    version: 'v4',
    platform: 'app-android',
    requiredFiles: [
      'unpackage/dist/dev/app-android/manifest.json',
      'unpackage/dist/dev/app-android/pages/index/index/classes.dex',
    ],
    styleFiles: ['unpackage/dist/dev/.uvue/app-android/pages/index/index.uvue'],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B'],
  }),
  uniAppXAppCase({
    version: 'v4',
    platform: 'app-ios',
    requiredFiles: ['unpackage/dist/dev/app-ios/manifest.json'],
    styleFiles: ['unpackage/dist/dev/app-ios/app-service.js'],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B'],
  }),
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
