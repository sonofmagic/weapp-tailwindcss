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
    styleFiles: [`${outputDir}/${styleFile}`],
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
    styleFiles: ['dist/build/h5/assets'],
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
    styleFiles: ['dist/build/h5/client/assets'],
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
    styleContains: options.styleContains,
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

export function taroMiniCase(options: {
  project: string
  packageName: string
  platform: 'alipay'
}): BuildOutputCase {
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
      'dist/app.json',
      'dist/app.acss',
      'dist/pages/index/index.axml',
    ],
    styleFiles: ['dist/app.acss'],
    textFiles: ['dist/pages/index/index.js'],
    styleContains: ['.bg-_b_h534312_B', '.text-_b_hfff_B', '.before_ccontent'],
    textContains: ['bg-_b_h534312_B', 'text-_b_hfff_B'],
    notContains: [rawTailwindDirectiveRE],
    status: 'local',
    reason: 'Taro Alipay 通过 pnpm e2e:multiplatform-build:taro-alipay 做专项构建与只读断言；本地 Taro runner 可能因系统依赖挂起，不放入默认 vitest/execa 构建集合。',
  }
}
