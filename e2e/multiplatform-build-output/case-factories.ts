import type { BuildOutputCase } from './types'
import { rawTailwindDirectiveRE } from './helpers'

const miniStyleFileByPlatform: Record<string, string> = {
  'mp-alipay': 'app.acss',
  'mp-baidu': 'app.css',
  'mp-jd': 'app.jxss',
  'mp-kuaishou': 'app.css',
  'mp-lark': 'app.ttss',
  'mp-qq': 'app.qss',
  'mp-toutiao': 'app.ttss',
  'mp-weixin': 'app.wxss',
  'mp-xhs': 'app.css',
}

export function uniAppMiniCase(options: {
  project: string
  platform: keyof typeof miniStyleFileByPlatform
  styleContains: Array<string | RegExp>
  textFile?: string
  textContains?: Array<string | RegExp>
}): BuildOutputCase {
  const outputDir = `dist/build/${options.platform}`
  const styleFile = miniStyleFileByPlatform[options.platform]
  return {
    name: `${options.project} ${options.platform}`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', 'run', `build:${options.platform}`],
    outputDir,
    requiredFiles: [
      `${outputDir}/app.js`,
      `${outputDir}/app.json`,
      `${outputDir}/${styleFile}`,
    ],
    styleFiles: [outputDir],
    styleFileExtensions: [styleFile.slice(styleFile.lastIndexOf('.'))],
    textFiles: options.textFile ? [`${outputDir}/${options.textFile}`] : undefined,
    styleContains: options.styleContains,
    textContains: options.textContains,
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

export function uniAppH5Case(options: {
  project: string
  styleContains: Array<string | RegExp>
}): BuildOutputCase {
  return {
    name: `${options.project} h5`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform: 'h5',
    command: ['pnpm', 'run', 'build:h5'],
    outputDir: 'dist/build/h5',
    requiredFiles: ['dist/build/h5/index.html'],
    styleFiles: ['dist/build/h5'],
    styleFileExtensions: ['.css'],
    textFiles: ['dist/build/h5/index.html'],
    styleContains: options.styleContains,
    textContains: ['<html'],
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

export function uniAppH5SsrCase(options: {
  project: string
  styleContains: Array<string | RegExp>
}): BuildOutputCase {
  return {
    name: `${options.project} h5:ssr`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform: 'h5:ssr',
    command: ['pnpm', 'run', 'build:h5:ssr'],
    outputDir: 'dist/build/h5',
    requiredFiles: [
      'dist/build/h5/client/index.html',
      'dist/build/h5/client/ssr-manifest.json',
      'dist/build/h5/server/entry-server.js',
      'dist/build/h5/server/index.html',
    ],
    styleFiles: ['dist/build/h5/client'],
    styleFileExtensions: ['.css'],
    textFiles: ['dist/build/h5/client/index.html', 'dist/build/h5/server/index.html'],
    styleContains: options.styleContains,
    textContains: ['<html'],
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

export function uniAppQuickappCase(options: {
  project: string
  platform: 'quickapp-webview' | 'quickapp-webview-huawei' | 'quickapp-webview-union'
  styleContains: Array<string | RegExp>
}): BuildOutputCase {
  const outputDir = `dist/build/${options.platform}`
  return {
    name: `${options.project} ${options.platform}`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', 'run', `build:${options.platform}`],
    outputDir,
    requiredFiles: [
      `${outputDir}/app.js`,
      `${outputDir}/app.json`,
      `${outputDir}/app.css`,
    ],
    styleFiles: [outputDir],
    styleFileExtensions: ['.css'],
    styleContains: options.styleContains,
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

export function uniAppHBuilderXMiniCase(options: {
  project: string
  version: 'v3' | 'v4'
}): BuildOutputCase {
  const outputDir = 'dist/build/mp-weixin'
  return {
    name: `${options.project} mp-weixin`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform: 'mp-weixin',
    command: ['pnpm', 'run', 'build:mp-weixin'],
    outputDir,
    requiredFiles: [
      `${outputDir}/app.js`,
      `${outputDir}/app.json`,
      `${outputDir}/app.wxss`,
      `${outputDir}/pages/index/index.wxml`,
    ],
    styleFiles: [outputDir],
    styleFileExtensions: ['.wxss'],
    textFiles: [`${outputDir}/pages/index/index.wxml`],
    styleContains: [
      '.bg-_b_h123456_B',
      '.text-_b_h888800_B',
      '.w-_b120px_B',
      '.h-_b6rem_B',
    ],
    textContains: [
      'bg-_b_h123456_B',
      'text-_b_h888800_B',
      'w-_b120px_B',
      'h-_b6rem_B',
    ],
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

export function mpxCase(options: {
  project: string
  version: 'v3' | 'v4'
  platform: 'wx' | 'ali' | 'swan' | 'tt' | 'dd'
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
    styleFileExtensions: ['.wxss'],
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
          '.before_ccontent',
        ],
    textContains: options.version === 'v4'
      ? [
          'bg-_b_h123456_B',
          'text-_b_hbada55_B',
        ]
      : [
          'bg-_b_h123456_B',
          'before_ccontent',
        ],
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

const taroMiniOutputByPlatform = {
  alipay: {
    appJson: 'dist/app.json',
    appStyle: 'dist/app.acss',
    pageScript: 'dist/pages/index/index.js',
    pageTemplate: 'dist/pages/index/index.axml',
  },
  tt: {
    appJson: 'dist/app.json',
    appStyle: 'dist/app.ttss',
    pageScript: 'dist/pages/index/index.js',
    pageTemplate: 'dist/pages/index/index.ttml',
  },
} as const

export function taroMiniCase(options: {
  project: string
  packageName: string
  platform: keyof typeof taroMiniOutputByPlatform
  styleContains: Array<string | RegExp>
  textContains: Array<string | RegExp>
  fileAssertions?: BuildOutputCase['fileAssertions']
  status?: BuildOutputCase['status']
  reason?: string
}): BuildOutputCase {
  const output = taroMiniOutputByPlatform[options.platform]
  return {
    name: `${options.project} ${options.platform}`,
    framework: 'taro',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', '--filter', options.packageName, 'run', `build:${options.platform}`],
    commandCwd: 'repo',
    outputDir: 'dist',
    requiredFiles: [
      'dist/app.js',
      output.appJson,
      output.appStyle,
      output.pageTemplate,
    ],
    styleFiles: ['dist'],
    styleFileExtensions: [options.platform === 'alipay' ? '.acss' : '.ttss'],
    textFiles: [output.pageScript],
    styleContains: options.styleContains,
    textContains: options.textContains,
    fileAssertions: options.fileAssertions,
    notContains: [rawTailwindDirectiveRE],
    status: options.status ?? 'local',
    reason: options.reason ?? 'Taro 非微信小程序目标通过多平台构建专项断言；本地 runner 可能因系统依赖挂起，不放入默认 vitest/execa 构建集合。',
  }
}

export function gulpMiniCase(options: {
  project: string
  platform: 'tt'
  styleContains: Array<string | RegExp>
  textContains: Array<string | RegExp>
}): BuildOutputCase {
  return {
    name: `${options.project} ${options.platform}`,
    framework: 'gulp',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', 'run', `build:${options.platform}`],
    outputDir: 'dist',
    requiredFiles: [
      'dist/app.ttss',
      'dist/pages/index/index.ttml',
      'dist/pages/index/index.ttss',
      'dist/sub-normal/pages/index.ttml',
      'dist/sub-normal/pages/index.ttss',
    ],
    styleFiles: ['dist'],
    styleFileExtensions: ['.ttss'],
    textFiles: ['dist'],
    styleContains: options.styleContains,
    textContains: options.textContains,
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}
