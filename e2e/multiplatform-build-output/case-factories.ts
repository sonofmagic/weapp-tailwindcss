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

const miniTemplateFileByPlatform: Record<string, string> = {
  'mp-alipay': 'pages/index/index.axml',
  'mp-baidu': 'pages/index/index.swan',
  'mp-jd': 'pages/index/index.jxml',
  'mp-kuaishou': 'pages/index/index.ksml',
  'mp-lark': 'pages/index/index.ttml',
  'mp-qq': 'pages/index/index.qml',
  'mp-toutiao': 'pages/index/index.ttml',
  'mp-weixin': 'pages/index/index.wxml',
  'mp-xhs': 'pages/index/index.xml',
}

function cssMarker(value: string) {
  return `.${value}`
}

function createSubpackageCssAssertions(options: {
  appStyleFile: string
  normalStyleFile: string
  independentStyleFile: string
  mainMarker: string
  normalMarker: string
  independentMarker: string
  singleEntry: boolean
}) {
  const allMarkers = [
    cssMarker(options.mainMarker),
    cssMarker(options.normalMarker),
    cssMarker(options.independentMarker),
  ]

  if (options.singleEntry) {
    return [
      {
        file: options.appStyleFile,
        contains: allMarkers,
        notContains: [rawTailwindDirectiveRE],
      },
    ]
  }

  return [
    {
      file: options.appStyleFile,
      contains: [cssMarker(options.mainMarker)],
      notContains: [cssMarker(options.normalMarker), cssMarker(options.independentMarker), rawTailwindDirectiveRE],
    },
    {
      file: options.normalStyleFile,
      contains: [cssMarker(options.normalMarker)],
      notContains: [cssMarker(options.mainMarker), cssMarker(options.independentMarker), rawTailwindDirectiveRE],
    },
    {
      file: options.independentStyleFile,
      contains: [cssMarker(options.independentMarker)],
      notContains: [cssMarker(options.mainMarker), cssMarker(options.normalMarker), rawTailwindDirectiveRE],
    },
  ] satisfies BuildOutputCase['fileAssertions']
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

export function uniAppSubpackageMiniCase(options: {
  project: string
  platform: keyof typeof miniStyleFileByPlatform
  mode: 'isolated' | 'single'
  markers: {
    main: string
    normal: string
    independent: string
  }
}): BuildOutputCase {
  const outputDir = `dist/build/${options.platform}`
  const appStyleFile = miniStyleFileByPlatform[options.platform]
  const extension = appStyleFile.slice(appStyleFile.lastIndexOf('.'))
  const singleEntry = options.mode === 'single'
  const mainStyleFile = singleEntry ? `main.single${extension}` : `main${extension}`
  return {
    name: `${options.project} ${options.platform} ${options.mode}`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', 'run', `build:${options.platform}`],
    env: singleEntry ? { E2E_TW_CSS_ENTRY_MODE: 'single' } : undefined,
    outputDir,
    requiredFiles: [
      `${outputDir}/app.js`,
      `${outputDir}/app.json`,
      `${outputDir}/${appStyleFile}`,
      `${outputDir}/${mainStyleFile}`,
      `${outputDir}/${miniTemplateFileByPlatform[options.platform]}`,
      `${outputDir}/sub-normal/pages/index${extension}`,
      `${outputDir}/sub-independent/pages/index${extension}`,
    ],
    styleFiles: [outputDir],
    styleFileExtensions: [extension],
    textFiles: [outputDir],
    styleContains: singleEntry
      ? [cssMarker(options.markers.main), cssMarker(options.markers.normal), cssMarker(options.markers.independent)]
      : [cssMarker(options.markers.main), cssMarker(options.markers.normal), cssMarker(options.markers.independent)],
    textContains: [options.markers.main, options.markers.normal, options.markers.independent],
    fileAssertions: createSubpackageCssAssertions({
      appStyleFile: `${outputDir}/${mainStyleFile}`,
      normalStyleFile: `${outputDir}/sub-normal/pages/index${extension}`,
      independentStyleFile: `${outputDir}/sub-independent/pages/index${extension}`,
      mainMarker: options.markers.main,
      normalMarker: options.markers.normal,
      independentMarker: options.markers.independent,
      singleEntry,
    }),
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

export function uniAppSubpackageH5Case(options: {
  project: string
  mode: 'isolated' | 'single'
  ssr?: boolean
  markers: {
    main: string
    normal: string
    independent: string
  }
}): BuildOutputCase {
  const singleEntry = options.mode === 'single'
  const platform = options.ssr ? 'h5:ssr' : 'h5'
  return {
    name: `${options.project} ${platform} ${options.mode}`,
    framework: 'uni-app',
    projectDir: `demo/${options.project}`,
    platform,
    command: ['pnpm', 'run', options.ssr ? 'build:h5:ssr' : 'build:h5'],
    env: singleEntry ? { E2E_TW_CSS_ENTRY_MODE: 'single' } : undefined,
    outputDir: 'dist/build/h5',
    requiredFiles: options.ssr
      ? [
          'dist/build/h5/client/index.html',
          'dist/build/h5/client/ssr-manifest.json',
          'dist/build/h5/server/entry-server.js',
          'dist/build/h5/server/index.html',
        ]
      : ['dist/build/h5/index.html'],
    styleFiles: [options.ssr ? 'dist/build/h5/client' : 'dist/build/h5'],
    styleFileExtensions: ['.css'],
    textFiles: options.ssr
      ? ['dist/build/h5/client/index.html', 'dist/build/h5/server/index.html']
      : ['dist/build/h5/index.html'],
    styleContains: [cssMarker(options.markers.main), cssMarker(options.markers.normal), cssMarker(options.markers.independent)],
    textContains: ['<div id="app"></div>'],
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

export function taroSubpackageMiniCase(options: {
  project: string
  packageName: string
  platform: keyof typeof taroMiniOutputByPlatform
  mode: 'isolated' | 'single'
  markers: {
    main: string
    normal: string
    independent: string
  }
}): BuildOutputCase {
  const output = taroMiniOutputByPlatform[options.platform]
  const extension = options.platform === 'alipay' ? '.acss' : '.ttss'
  const singleEntry = options.mode === 'single'
  return {
    name: `${options.project} ${options.platform} ${options.mode}`,
    framework: 'taro',
    projectDir: `demo/${options.project}`,
    platform: options.platform,
    command: ['pnpm', '--filter', options.packageName, 'run', `build:${options.platform}`],
    commandCwd: 'repo',
    env: singleEntry ? { E2E_TW_CSS_ENTRY_MODE: 'single' } : undefined,
    outputDir: 'dist',
    requiredFiles: [
      'dist/app.js',
      output.appJson,
      output.appStyle,
      output.pageTemplate,
      `dist/sub-normal/pages/index${extension}`,
      `dist/sub-independent/pages/index${extension}`,
    ],
    styleFiles: ['dist'],
    styleFileExtensions: [extension],
    textFiles: ['dist'],
    styleContains: [cssMarker(options.markers.main), cssMarker(options.markers.normal), cssMarker(options.markers.independent)],
    textContains: [options.markers.main, options.markers.normal, options.markers.independent],
    fileAssertions: createSubpackageCssAssertions({
      appStyleFile: output.appStyle,
      normalStyleFile: `dist/sub-normal/pages/index${extension}`,
      independentStyleFile: `dist/sub-independent/pages/index${extension}`,
      mainMarker: options.markers.main,
      normalMarker: options.markers.normal,
      independentMarker: options.markers.independent,
      singleEntry,
    }),
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
  }
}

export function taroSubpackageH5Case(options: {
  project: string
  packageName: string
  mode: 'isolated' | 'single'
  markers: {
    main: string
    normal: string
    independent: string
  }
}): BuildOutputCase {
  const singleEntry = options.mode === 'single'
  return {
    name: `${options.project} h5 ${options.mode}`,
    framework: 'taro',
    projectDir: `demo/${options.project}`,
    platform: 'h5',
    command: ['pnpm', '--filter', options.packageName, 'run', 'build:h5'],
    commandCwd: 'repo',
    env: singleEntry ? { E2E_TW_CSS_ENTRY_MODE: 'single' } : undefined,
    outputDir: 'dist',
    requiredFiles: [
      'dist/js/app.js',
    ],
    styleFiles: ['dist'],
    styleFileExtensions: ['.css'],
    styleContains: [cssMarker(options.markers.main), cssMarker(options.markers.normal), cssMarker(options.markers.independent)],
    notContains: [rawTailwindDirectiveRE],
    status: 'ci',
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

function importPathTo(scopeFile: string) {
  return new RegExp(`@import\\s+["'][^"']*${scopeFile.replace('.', '\\.')}["']`)
}

function hashedMpxAppStyleImport() {
  return /@import\s+["']\.\/styles\/app[^"']*\.wxss["']/
}

function cssSelector(value: string) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`${escaped}(?=[\\s,{.:#>+~\\[]|$)`)
}

export function styleInjectorUniAppMiniCase(options: {
  project: string
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
      `${outputDir}/sub-normal/index.wxss`,
      `${outputDir}/sub-normal/page.wxss`,
      `${outputDir}/sub-normal/component.wxss`,
      `${outputDir}/sub-normal/weapp.wxss`,
      `${outputDir}/sub-normal/ali.wxss`,
      `${outputDir}/sub-normal/pages/index.wxss`,
      `${outputDir}/sub-normal/pages/index.weapp.wxss`,
      `${outputDir}/sub-normal/pages/index.ali.wxss`,
      `${outputDir}/sub-normal/components/NormalBadge.wxss`,
      `${outputDir}/sub-independent/index.wxss`,
      `${outputDir}/sub-independent/pages/index.wxss`,
    ],
    styleFiles: [outputDir],
    styleFileExtensions: ['.wxss'],
    textFiles: [outputDir],
    styleContains: [
      '.injector-uni-main',
      '.injector-uni-normal',
      '.injector-uni-normal-page-entry',
      '.injector-uni-normal-component-entry',
      '.injector-uni-weapp-entry',
      '.injector-uni-ali-entry',
      '.injector-uni-independent',
    ],
    textContains: [
      'injector-uni-main',
      'injector-uni-normal',
      'injector-uni-independent',
    ],
    fileAssertions: [
      {
        file: `${outputDir}/app.wxss`,
        contains: ['.injector-uni-main'],
        notContains: [cssSelector('.injector-uni-normal'), cssSelector('.injector-uni-independent')],
      },
      {
        file: `${outputDir}/sub-normal/pages/index.wxss`,
        contains: [importPathTo('index.wxss'), importPathTo('page.wxss')],
        notContains: [importPathTo('component.wxss'), cssSelector('.injector-uni-main'), cssSelector('.injector-uni-independent')],
      },
      {
        file: `${outputDir}/sub-normal/components/NormalBadge.wxss`,
        contains: [importPathTo('index.wxss'), importPathTo('component.wxss')],
        notContains: [importPathTo('page.wxss'), cssSelector('.injector-uni-main'), cssSelector('.injector-uni-independent')],
      },
      {
        file: `${outputDir}/sub-normal/index.wxss`,
        contains: ['.injector-uni-normal'],
        notContains: ['@import', cssSelector('.injector-uni-normal-page-entry'), cssSelector('.injector-uni-normal-component-entry'), cssSelector('.injector-uni-main'), cssSelector('.injector-uni-independent')],
      },
      {
        file: `${outputDir}/sub-normal/page.wxss`,
        contains: ['.injector-uni-normal-page-entry'],
        notContains: ['@import', cssSelector('.injector-uni-normal'), cssSelector('.injector-uni-normal-component-entry')],
      },
      {
        file: `${outputDir}/sub-normal/component.wxss`,
        contains: ['.injector-uni-normal-component-entry'],
        notContains: ['@import', cssSelector('.injector-uni-normal'), cssSelector('.injector-uni-normal-page-entry')],
      },
      {
        file: `${outputDir}/sub-normal/pages/index.weapp.wxss`,
        contains: [importPathTo('weapp.wxss')],
        notContains: [importPathTo('ali.wxss'), importPathTo('page.wxss'), importPathTo('component.wxss')],
      },
      {
        file: `${outputDir}/sub-normal/pages/index.ali.wxss`,
        contains: [importPathTo('ali.wxss')],
        notContains: [importPathTo('weapp.wxss'), importPathTo('page.wxss'), importPathTo('component.wxss')],
      },
      {
        file: `${outputDir}/sub-normal/weapp.wxss`,
        contains: ['.injector-uni-weapp-entry'],
        notContains: ['@import', cssSelector('.injector-uni-ali-entry')],
      },
      {
        file: `${outputDir}/sub-normal/ali.wxss`,
        contains: ['.injector-uni-ali-entry'],
        notContains: ['@import', cssSelector('.injector-uni-weapp-entry')],
      },
      {
        file: `${outputDir}/sub-independent/pages/index.wxss`,
        contains: [importPathTo('index.wxss')],
        notContains: [cssSelector('.injector-uni-main'), cssSelector('.injector-uni-normal')],
      },
      {
        file: `${outputDir}/sub-independent/index.wxss`,
        contains: ['.injector-uni-independent'],
        notContains: ['@import', cssSelector('.injector-uni-main'), cssSelector('.injector-uni-normal')],
      },
    ],
    status: 'ci',
  }
}

export function styleInjectorUniAppH5Case(options: {
  project: string
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
    styleContains: [
      '.injector-uni-main',
      '.injector-uni-normal',
      '.injector-uni-normal-page-entry',
      '.injector-uni-normal-component-entry',
      '.injector-uni-weapp-entry',
      '.injector-uni-ali-entry',
      '.injector-uni-independent',
    ],
    textContains: ['<html'],
    fileAssertions: [
      {
        file: 'dist/build/h5/sub-normal/pages/index.css',
        contains: [importPathTo('index.css'), importPathTo('page.css'), '.injector-uni-normal-page'],
        notContains: [importPathTo('component.css')],
      },
      {
        file: 'dist/build/h5/sub-normal/components/NormalBadge.css',
        contains: [importPathTo('index.css'), importPathTo('component.css'), '.injector-uni-normal-component-local'],
        notContains: [importPathTo('page.css')],
      },
      {
        file: 'dist/build/h5/sub-normal/page.css',
        contains: ['.injector-uni-normal-page-entry'],
        notContains: ['@import'],
      },
      {
        file: 'dist/build/h5/sub-normal/component.css',
        contains: ['.injector-uni-normal-component-entry'],
        notContains: ['@import', cssSelector('.injector-uni-normal-page-entry')],
      },
      {
        file: 'dist/build/h5/sub-normal/pages/index.weapp.css',
        contains: [importPathTo('weapp.css')],
        notContains: [importPathTo('ali.css'), importPathTo('page.css'), importPathTo('component.css')],
      },
      {
        file: 'dist/build/h5/sub-normal/pages/index.ali.css',
        contains: [importPathTo('ali.css')],
        notContains: [importPathTo('weapp.css'), importPathTo('page.css'), importPathTo('component.css')],
      },
      {
        file: 'dist/build/h5/sub-normal/weapp.css',
        contains: ['.injector-uni-weapp-entry'],
        notContains: ['@import', cssSelector('.injector-uni-ali-entry')],
      },
      {
        file: 'dist/build/h5/sub-normal/ali.css',
        contains: ['.injector-uni-ali-entry'],
        notContains: ['@import', cssSelector('.injector-uni-weapp-entry')],
      },
    ],
    status: 'ci',
  }
}

export function styleInjectorMpxMiniCase(options: {
  project: string
}): BuildOutputCase {
  return {
    name: `${options.project} wx`,
    framework: 'mpx',
    projectDir: `demo/${options.project}`,
    platform: 'wx',
    command: ['pnpm', 'run', 'build'],
    env: {
      MPX_CURRENT_TARGET_MODE: 'wx',
    },
    outputDir: 'dist/wx',
    requiredFiles: [
      'dist/wx/app.js',
      'dist/wx/app.json',
      'dist/wx/app.wxss',
      'dist/wx/sub-normal/index.wxss',
      'dist/wx/sub-normal/pages/index.wxss',
      'dist/wx/sub-independent/index.wxss',
      'dist/wx/sub-independent/pages/index.wxss',
    ],
    styleFiles: ['dist/wx'],
    styleFileExtensions: ['.wxss'],
    textFiles: ['dist/wx'],
    styleContains: [
      '.injector-mpx-main',
      '.injector-mpx-normal',
      '.injector-mpx-independent',
    ],
    textContains: [
      'injector-mpx-main',
      'injector-mpx-normal',
      'injector-mpx-independent',
    ],
    fileAssertions: [
      {
        file: 'dist/wx/app.wxss',
        contains: [hashedMpxAppStyleImport()],
        notContains: [cssSelector('.injector-mpx-normal'), cssSelector('.injector-mpx-independent')],
      },
      {
        file: 'dist/wx/sub-normal/pages/index.wxss',
        contains: [importPathTo('index.wxss')],
        notContains: [cssSelector('.injector-mpx-main'), cssSelector('.injector-mpx-independent')],
      },
      {
        file: 'dist/wx/sub-normal/index.wxss',
        contains: ['.injector-mpx-normal'],
        notContains: ['@import', cssSelector('.injector-mpx-main'), cssSelector('.injector-mpx-independent')],
      },
      {
        file: 'dist/wx/sub-independent/pages/index.wxss',
        contains: [importPathTo('index.wxss')],
        notContains: [cssSelector('.injector-mpx-main'), cssSelector('.injector-mpx-normal')],
      },
      {
        file: 'dist/wx/sub-independent/index.wxss',
        contains: ['.injector-mpx-independent'],
        notContains: ['@import', cssSelector('.injector-mpx-main'), cssSelector('.injector-mpx-normal')],
      },
    ],
    status: 'ci',
  }
}

export function styleInjectorTaroMiniCase(options: {
  project: string
  packageName: string
  markerPrefix: string
  bundler: 'webpack' | 'vite'
}): BuildOutputCase {
  const mainMarker = `.injector-${options.markerPrefix}-main`
  const normalMarker = `.injector-${options.markerPrefix}-normal`
  const independentMarker = `.injector-${options.markerPrefix}-independent`
  const isVite = options.bundler === 'vite'
  return {
    name: `${options.project} weapp`,
    framework: 'taro',
    projectDir: `demo/${options.project}`,
    platform: 'weapp',
    command: ['pnpm', '--filter', options.packageName, 'run', 'build:weapp'],
    commandCwd: 'repo',
    outputDir: 'dist',
    requiredFiles: [
      'dist/app.js',
      'dist/app.json',
      'dist/app.wxss',
      ...(isVite ? ['dist/app-origin.wxss'] : []),
      'dist/sub-normal/index.wxss',
      'dist/sub-normal/pages/index.wxss',
      ...(isVite
        ? ['dist/sub-independent/index.wxss', 'dist/sub-independent/pages/index.wxss']
        : [
            'dist/sub-independent/index.wxss',
            'dist/sub-independent/pages/index.wxss',
          ]),
    ],
    styleFiles: ['dist'],
    styleFileExtensions: ['.wxss'],
    textFiles: ['dist'],
    styleContains: [
      mainMarker,
      normalMarker,
      independentMarker,
    ],
    textContains: [
      `injector-${options.markerPrefix}-main`,
      `injector-${options.markerPrefix}-normal`,
      `injector-${options.markerPrefix}-independent`,
    ],
    fileAssertions: [
      {
        file: isVite ? 'dist/app-origin.wxss' : 'dist/app.wxss',
        contains: [mainMarker],
        notContains: [cssSelector(normalMarker), cssSelector(independentMarker)],
      },
      {
        file: 'dist/sub-normal/pages/index.wxss',
        contains: [importPathTo('index.wxss')],
        notContains: [cssSelector(mainMarker), cssSelector(independentMarker)],
      },
      {
        file: 'dist/sub-normal/index.wxss',
        contains: [normalMarker],
        notContains: ['@import', cssSelector(mainMarker), cssSelector(independentMarker)],
      },
      {
        file: 'dist/sub-independent/pages/index.wxss',
        contains: [importPathTo('index.wxss')],
        notContains: [cssSelector(mainMarker), cssSelector(normalMarker)],
      },
      {
        file: 'dist/sub-independent/index.wxss',
        contains: [independentMarker],
        notContains: ['@import', cssSelector(mainMarker), cssSelector(normalMarker)],
      },
      {
        file: 'dist/app.wxss',
        contains: isVite ? ['@import'] : [mainMarker],
      },
    ],
    status: 'ci',
  }
}

export function styleInjectorTaroH5Case(options: {
  project: string
  packageName: string
  markerPrefix: string
  bundler: 'webpack' | 'vite'
}): BuildOutputCase {
  return {
    name: `${options.project} h5`,
    framework: 'taro',
    projectDir: `demo/${options.project}`,
    platform: 'h5',
    command: ['pnpm', '--filter', options.packageName, 'run', 'build:h5'],
    commandCwd: 'repo',
    outputDir: 'dist',
    requiredFiles: options.bundler === 'webpack'
      ? ['dist/js/app.js']
      : ['dist/index.html'],
    styleFiles: ['dist'],
    styleFileExtensions: ['.css'],
    styleContains: [
      `.injector-${options.markerPrefix}-main`,
      `.injector-${options.markerPrefix}-normal`,
      `.injector-${options.markerPrefix}-independent`,
    ],
    status: 'ci',
  }
}
