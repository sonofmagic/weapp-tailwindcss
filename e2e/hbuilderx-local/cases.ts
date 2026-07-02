import process from 'node:process'

export const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/

export interface MiniProgramCase {
  name: string
  platform: MiniProgramPlatform
  projectDir: string
  outputDir: string
  outputDirCandidates?: string[]
  cssFiles: string[]
  requiredFiles: string[]
  cssContains: Array<string | RegExp>
  cssNotContains?: Array<string | RegExp>
  outputContains?: Record<string, Array<string | RegExp>>
  workflow: HBuilderXWorkflowCoverage
}

export type MiniProgramPlatform = 'mp-alipay' | 'mp-baidu' | 'mp-toutiao' | 'mp-weixin'
export type AppPlatform = 'app-android' | 'app-ios' | 'app-harmony'

export interface AppCase {
  name: string
  platform: AppPlatform
  projectDir: string
  outputDir: string
  outputDirCandidates?: string[]
  sourceFile: string
  markerAnchor: string
  markerAnchorCandidates?: string[]
  markerClass: string
  markerText: string
  hmrMarkerClass: string
  hmrMarkerText: string
  launchArgs?: string[]
  launchEnv?: Record<string, string>
  requiredFiles: string[]
  transformedFiles?: string[]
  transformedOutputFiles?: string[]
  transformedContains: Array<string | RegExp>
  hmrTransformedContains: Array<string | RegExp>
  styleOutputFiles?: string[]
  styleContains?: Array<string | RegExp>
  hmrStyleContains?: Array<string | RegExp>
}

export interface WebCase {
  name: string
  projectDir: string
  sourceFile: string
  markerAnchor: string
  markerAnchorCandidates?: string[]
  initialCssPath: string
  hmrCssPath: string
  initialCssContains: Array<string | RegExp>
  initialRuntimeStyles?: WebRuntimeStyleAssertion[]
  hmrSteps: WebHmrStep[]
  workflow: HBuilderXWorkflowCoverage
}

export interface HBuilderXWorkflowCoverage {
  staticTemplateClass: boolean
  dynamicClassBinding: boolean
  userAuthoredStyle: boolean
  thirdPartyOrExternalComponentStyle: boolean
  subpackageStyle: boolean
  webHmr: boolean
}

const uniAppHBuilderXWorkflow = {
  dynamicClassBinding: false,
  staticTemplateClass: true,
  subpackageStyle: true,
  thirdPartyOrExternalComponentStyle: false,
  userAuthoredStyle: false,
  webHmr: true,
} satisfies HBuilderXWorkflowCoverage

const uniAppXHBuilderXWorkflow = {
  dynamicClassBinding: true,
  staticTemplateClass: true,
  subpackageStyle: true,
  thirdPartyOrExternalComponentStyle: true,
  userAuthoredStyle: true,
  webHmr: true,
} satisfies HBuilderXWorkflowCoverage

export interface WebHmrStep {
  markerClass: string
  markerText: string
  cssContains: Array<string | RegExp>
  runtimeStyles?: WebRuntimeStyleAssertion[]
}

export interface WebRuntimeStyleAssertion {
  selector: string
  styles: Record<string, string | RegExp>
}

const hbuilderxMiniProgramOutputDirCandidates = [
  'unpackage/dist/dev/mp-weixin',
  'dist/dev/mp-weixin',
]

const uniAppHBuilderXMiniProgramPlatforms = [
  'mp-weixin',
  'mp-alipay',
  'mp-baidu',
  'mp-toutiao',
] satisfies MiniProgramPlatform[]

const miniProgramPlatformFiles = {
  'mp-alipay': {
    cssFiles: ['app.acss', 'main.acss', 'sub-normal/pages/index.acss', 'sub-independent/pages/index.acss'],
    outputDir: 'unpackage/dist/dev/mp-alipay',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.axml',
      independent: 'sub-independent/pages/index.axml',
      normal: 'sub-normal/pages/index.axml',
    },
  },
  'mp-baidu': {
    cssFiles: ['app.css', 'main.wxss', 'sub-normal/pages/index.wxss', 'sub-independent/pages/index.wxss'],
    outputDir: 'unpackage/dist/dev/mp-baidu',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.swan',
      independent: 'sub-independent/pages/index.swan',
      normal: 'sub-normal/pages/index.swan',
    },
  },
  'mp-toutiao': {
    cssFiles: ['app.ttss', 'main.ttss', 'sub-normal/pages/index.ttss', 'sub-independent/pages/index.ttss'],
    outputDir: 'unpackage/dist/dev/mp-toutiao',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.ttml',
      independent: 'sub-independent/pages/index.ttml',
      normal: 'sub-normal/pages/index.ttml',
    },
  },
  'mp-weixin': {
    cssFiles: ['app.wxss', 'main.wxss', 'sub-normal/pages/index.wxss', 'sub-independent/pages/index.wxss'],
    outputDir: 'unpackage/dist/dev/mp-weixin',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.wxml',
      independent: 'sub-independent/pages/index.wxml',
      normal: 'sub-normal/pages/index.wxml',
    },
  },
} satisfies Record<MiniProgramPlatform, {
  cssFiles: string[]
  outputDir: string
  requiredFiles: string[]
  templateFiles: {
    main: string
    independent: string
    normal: string
  }
}>

function createMiniProgramOutputDirCandidates(platform: MiniProgramPlatform) {
  return [
    `unpackage/dist/dev/${platform}`,
    `dist/dev/${platform}`,
  ]
}

function withMiniProgramPlatformName(name: string, platform: MiniProgramPlatform) {
  return platform === 'mp-weixin' ? name : `${name} ${platform}`
}

function createUniAppHBuilderXMiniProgramCase(options: {
  name: string
  platform: MiniProgramPlatform
  projectDir: string
  tailwindcss: 'v3' | 'v4'
}): MiniProgramCase {
  const platformFiles = miniProgramPlatformFiles[options.platform]
  const isTailwindV4 = options.tailwindcss === 'v4'
  const tailwindV4CssContains = [
    '.bg-_b_h123456_B',
    'background-color: #123456',
    '.bg-gradient-to-br',
    /--tw-gradient-position\s*:\s*to bottom right/,
    /background-image\s*:\s*linear-gradient\(var\(--tw-gradient-stops\)\)/,
    /background-image\s*:\s*radial-gradient\(circle at 18% 20%,#e0f2fe,#fdf4ff 70%\)/,
    /padding-top\s*:\s*24rpx/,
    /font-size\s*:\s*26rpx/,
    /border-radius\s*:\s*20rpx/,
    '.bg-_b_h68c828_B',
    '.text-_b100rpx_B',
    '.w-_b323px_B',
    '.h-_b45px_B',
    '.space-y-2>view+view',
    '.space-y-2>text+view',
    ...(options.platform === 'mp-weixin' ? ['.wx_cbg-blue-500'] : []),
    /normal[-_]subpackage/i,
    /independent[-_]subpackage/i,
  ]
  return {
    name: withMiniProgramPlatformName(options.name, options.platform),
    platform: options.platform,
    projectDir: options.projectDir,
    outputDir: platformFiles.outputDir,
    outputDirCandidates: createMiniProgramOutputDirCandidates(options.platform),
    cssFiles: platformFiles.cssFiles,
    requiredFiles: platformFiles.requiredFiles,
    cssContains: isTailwindV4
      ? tailwindV4CssContains
      : ['.bg-_b_h123456_B', /background-color:\s*rgba\(18,\s*52,\s*86/, /normal[-_]subpackage/i, /independent[-_]subpackage/i],
    cssNotContains: [rawTailwindDirectiveRE],
    outputContains: {
      'app.json': ['"root": "sub-normal"', '"root": "sub-independent"', '"independent": true'],
      [platformFiles.templateFiles.main]: [
        'template-corpus-card',
        'template-corpus-radial',
        'template-corpus-space',
        'template-corpus-apply',
        'template-corpus-hover',
      ],
      [platformFiles.templateFiles.independent]: ['bg-independent-subpackage-marker'],
      [platformFiles.templateFiles.normal]: ['bg-normal-subpackage-marker'],
    },
    workflow: uniAppHBuilderXWorkflow,
  }
}

function createUniAppHBuilderXMiniProgramCases(options: {
  name: string
  projectDir: string
  tailwindcss: 'v3' | 'v4'
}) {
  return uniAppHBuilderXMiniProgramPlatforms.map(platform => createUniAppHBuilderXMiniProgramCase({
    ...options,
    platform,
  }))
}

function createUniAppXHBuilderXMiniProgramCase(options: {
  name: string
  projectDir: string
}): MiniProgramCase {
  const platformFiles = miniProgramPlatformFiles['mp-weixin']
  return {
    name: options.name,
    platform: 'mp-weixin',
    projectDir: options.projectDir,
    outputDir: platformFiles.outputDir,
    outputDirCandidates: hbuilderxMiniProgramOutputDirCandidates,
    cssFiles: ['app.wxss', 'uvue.wxss', 'pages/index/index.wxss', 'components/BindClass.wxss', 'components/WeappTailwindcss.wxss', ...platformFiles.cssFiles.slice(1)],
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    cssContains: ['.bg-_b_h87add3_B', '.bg-_b_hd2e252_B', '.text-_b93_d54rpx_B', '.bg-_b_hf21903_B', '.text-_b_hda0e3c_B', '.w-64'],
    cssNotContains: [rawTailwindDirectiveRE],
    outputContains: {
      'app.json': ['"root": "sub-normal"', '"root": "sub-independent"', '"independent": true'],
      [platformFiles.templateFiles.independent]: ['bg-independent-subpackage-marker'],
      [platformFiles.templateFiles.normal]: ['bg-normal-subpackage-marker'],
    },
    workflow: uniAppXHBuilderXWorkflow,
  }
}

export const miniProgramCases: MiniProgramCase[] = [
  ...createUniAppHBuilderXMiniProgramCases({
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    tailwindcss: 'v4',
  }),
  createUniAppXHBuilderXMiniProgramCase({
    name: 'uni-app-x-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
  }),
]

const defaultAndroidLaunchArgs = ['--deviceId', process.env['E2E_HBUILDERX_ANDROID_DEVICE_ID'] ?? 'emulator-5554']
const defaultIosLaunchArgs = ['--iosTarget', process.env['E2E_HBUILDERX_IOS_TARGET'] ?? 'simulator']
const defaultHarmonyLaunchArgs = ['--deviceId', process.env['E2E_HBUILDERX_HARMONY_DEVICE_ID'] ?? process.env['DEMO_VISUAL_HARMONY_DEVICE_ID'] ?? '127.0.0.1:5559']
const harmonyInitialTransformedContains = [
  '"backgroundColor":"rgba(16,41,56,1)"',
  '"color":"rgba(247,251,255,1)"',
  '"width":173',
]
const harmonyHmrTransformedContains = [
  '"backgroundColor":"rgba(59,7,100,1)"',
  '"color":"rgba(254,240,138,1)"',
  '"height":41',
  '"marginTop":19',
]
const uniAppXAndroidInitialTransformedContains = [
  'bg-_b_h102938_B',
  'text-_b_hf7fbff_B',
  'w-_b173px_B',
]
const uniAppXAndroidHmrTransformedContains = [
  'bg-_b_h3b0764_B',
  'text-_b_hfef08a_B',
  'h-_b41px_B',
  'mt-_b19px_B',
]
function createUniAppAppCases(options: {
  name: string
  projectDir: string
  sourceFile: string
  markerAnchor: string
  markerAnchorCandidates?: string[]
  version: 'v3' | 'v4'
  outputDir?: string
  outputDirCandidates?: string[]
  requiredFiles?: string[]
  transformedFiles?: string[]
  transformedOutputFiles?: string[]
  launchEnv?: Record<string, string>
}) {
  const {
    name,
    projectDir,
    sourceFile,
    markerAnchor,
    markerAnchorCandidates,
    version,
    outputDir = 'dist/dev/app',
    outputDirCandidates,
    requiredFiles = ['manifest.json', 'app-service.js', 'app.css'],
    transformedFiles = [`${outputDir}/app-service.js`, `${outputDir}/app.css`],
    transformedOutputFiles,
    launchEnv,
  } = options
  const markerClass = 'bg-[#102938] text-[#f7fbff] w-[173px]'
  const hmrMarkerClass = 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]'
  const transformedClassNames = ['bg-[#102938]', 'text-[#f7fbff]', 'w-[173px]']
  const hmrTransformedClassNames = ['bg-[#3b0764]', 'text-[#fef08a]', 'h-[41px]', 'mt-[19px]']
  const styleContains = ['.bg-\\[\\#102938\\]', '.text-\\[\\#f7fbff\\]', '.w-\\[173px\\]']
  const hmrStyleContains = ['.bg-\\[\\#3b0764\\]', '.text-\\[\\#fef08a\\]', '.h-\\[41px\\]', '.mt-\\[19px\\]']

  function createOutputDirCandidates(platform: AppPlatform) {
    const defaults = [
      outputDir,
      'dist/dev/app',
      'dist/dev/app-plus',
      `dist/dev/${platform}`,
      'unpackage/dist/dev/app',
      'unpackage/dist/dev/app-plus',
      `unpackage/dist/dev/${platform}`,
    ]
    return [...new Set(outputDirCandidates ?? defaults)]
  }

  function createCase(platform: AppPlatform, platformName: 'android' | 'ios'): AppCase {
    return {
      name: `${name} ${platformName}`,
      platform,
      projectDir,
      outputDir,
      outputDirCandidates: createOutputDirCandidates(platform),
      sourceFile,
      markerAnchor,
      markerAnchorCandidates,
      markerClass,
      markerText: `hbuilderx-app-dynamic-${version}-${platformName}`,
      hmrMarkerClass,
      hmrMarkerText: `hbuilderx-app-hmr-${version}-${platformName}`,
      launchArgs: platform === 'app-android' ? defaultAndroidLaunchArgs : defaultIosLaunchArgs,
      launchEnv,
      requiredFiles,
      transformedFiles,
      transformedOutputFiles,
      transformedContains: [...transformedClassNames, `hbuilderx-app-dynamic-${version}-${platformName}`],
      hmrTransformedContains: [...hmrTransformedClassNames, `hbuilderx-app-hmr-${version}-${platformName}`],
      styleOutputFiles: ['app.css'],
      styleContains,
      hmrStyleContains,
    }
  }

  return [
    createCase('app-android', 'android'),
    createCase('app-ios', 'ios'),
  ] satisfies AppCase[]
}

export const uniAppAppCases: AppCase[] = [
  ...createUniAppAppCases({
    name: 'uni-app-vite-tailwindcss-v4',
    projectDir: 'demo/uni-app-vite-tailwindcss-v4',
    sourceFile: 'src/pages/index/index.vue',
    markerAnchor: '<view class="i-mdi-home">',
    version: 'v4',
    launchEnv: {
      UNI_INPUT_DIR: 'src',
    },
    transformedFiles: [],
    transformedOutputFiles: ['app-service.js', 'app.css'],
  }),
  ...createUniAppAppCases({
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    sourceFile: 'pages/index/index.vue',
    markerAnchor: '<view class="text-[#888800]">',
    markerAnchorCandidates: [
      '<view class="text-[#888800]">',
      '<view class="text-[red]">',
    ],
    version: 'v4',
    outputDir: 'unpackage/dist/dev/app',
    transformedFiles: [],
    transformedOutputFiles: ['app-service.js', 'app.css'],
  }),
]

export const uniAppXAppCases: AppCase[] = [
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4 android',
    platform: 'app-android',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    outputDir: '.debug/bundle-post/asset',
    outputDirCandidates: [
      '.debug/bundle-post/asset',
      'unpackage/dist/dev/.tsc/app-android',
      'unpackage/dist/dev/.uvue/app-android',
      'unpackage/dist/dev/app-android',
    ],
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    markerClass: 'bg-[#102938] text-[#f7fbff] w-[173px]',
    markerText: 'hbuilderx-app-dynamic-v4-android',
    hmrMarkerClass: 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]',
    hmrMarkerText: 'hbuilderx-app-hmr-v4-android',
    launchArgs: defaultAndroidLaunchArgs,
    requiredFiles: [
      'App.uvue',
      'pages/index/index.uvue.ts',
    ],
    transformedOutputFiles: [
      'App.uvue',
      'pages/index/index.uvue.ts',
    ],
    transformedContains: uniAppXAndroidInitialTransformedContains,
    hmrTransformedContains: uniAppXAndroidHmrTransformedContains,
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4 ios',
    platform: 'app-ios',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/app-ios',
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    markerClass: 'bg-[#102938] text-[#f7fbff] w-[173px]',
    markerText: 'hbuilderx-app-dynamic-v4-ios',
    hmrMarkerClass: 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]',
    hmrMarkerText: 'hbuilderx-app-hmr-v4-ios',
    launchArgs: defaultIosLaunchArgs,
    requiredFiles: [
      'manifest.json',
    ],
    transformedFiles: [
      'unpackage/dist/dev/app-ios/app-service.js',
    ],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B', 'hbuilderx-app-dynamic-v4-ios'],
    hmrTransformedContains: ['bg-_b_h3b0764_B', 'text-_b_hfef08a_B', 'h-_b41px_B', 'mt-_b19px_B', 'hbuilderx-app-hmr-v4-ios'],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4 harmony',
    platform: 'app-harmony',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/.app-harmony',
    outputDirCandidates: [
      'unpackage/dist/dev/.app-harmony',
      'unpackage/dist/dev/app-harmony',
      'unpackage/cache/.app-harmony/sourcemap',
    ],
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    markerClass: 'bg-[#102938] text-[#f7fbff] w-[173px]',
    markerText: 'hbuilderx-app-dynamic-v4-harmony',
    hmrMarkerClass: 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]',
    hmrMarkerText: 'hbuilderx-app-hmr-v4-harmony',
    launchArgs: defaultHarmonyLaunchArgs,
    requiredFiles: [
      'manifest.json',
      'app-service.js',
      'assets/pages/index/index.js',
    ],
    transformedFiles: [
      'unpackage/dist/dev/.app-harmony/app-service.js',
      'unpackage/dist/dev/.app-harmony/assets/App.js',
      'unpackage/dist/dev/.app-harmony/assets/pages/index/index.js',
    ],
    transformedContains: [...harmonyInitialTransformedContains, 'hbuilderx-app-dynamic-v4-harmony'],
    hmrTransformedContains: [...harmonyHmrTransformedContains, 'hbuilderx-app-hmr-v4-harmony'],
  },
]

export const webCases: WebCase[] = [
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    sourceFile: 'pages/index/index.vue',
    markerAnchor: '<view class="text-[#888800]">',
    markerAnchorCandidates: [
      '<view class="text-[#888800]">',
      '<view class="text-[red]">',
    ],
    initialCssPath: '/main.css?direct',
    hmrCssPath: '/main.css?direct',
    initialCssContains: [/background-color:\s*#123456/],
    workflow: uniAppHBuilderXWorkflow,
    hmrSteps: [
      {
        markerClass: 'bg-[#0f5132] text-[#f8fafc] w-[188px]',
        markerText: 'hbuilderx-web-hmr-v4-step-1',
        cssContains: [/background-color:\s*#0f5132/, /color:\s*#f8fafc/, /width:\s*188px/],
      },
      {
        markerClass: 'bg-[#7c2d12] text-[#ecfeff] h-[37px] mt-[11px]',
        markerText: 'hbuilderx-web-hmr-v4-step-2',
        cssContains: [/background-color:\s*#7c2d12/, /color:\s*#ecfeff/, /height:\s*37px/, /margin-top:\s*11px/],
      },
      {
        markerClass: 'bg-[#4338ca] text-[#fef3c7] w-[221px] rounded-[13px]',
        markerText: 'hbuilderx-web-hmr-v4-step-3',
        cssContains: [/background-color:\s*#4338ca/, /color:\s*#fef3c7/, /width:\s*221px/, /border-radius:\s*13px/],
      },
    ],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    initialCssPath: '/main.css?direct',
    hmrCssPath: '/main.css?direct',
    initialCssContains: [/:root,\s*:host/, '--text-xl', '--color-white', /background-color:\s*#f21903/],
    workflow: uniAppXHBuilderXWorkflow,
    hmrSteps: [
      {
        markerClass: 'bg-[#0f5132] text-[#f8fafc] w-[188px]',
        markerText: 'hbuilderx-web-hmr-v4-step-1',
        cssContains: [/background-color:\s*#0f5132/, /color:\s*#f8fafc/, /width:\s*188px/],
      },
      {
        markerClass: 'bg-[#7c2d12] text-[#ecfeff] h-[37px] mt-[11px]',
        markerText: 'hbuilderx-web-hmr-v4-step-2',
        cssContains: [/background-color:\s*#7c2d12/, /color:\s*#ecfeff/, /height:\s*37px/, /margin-top:\s*11px/],
      },
      {
        markerClass: 'bg-[#4338ca] text-[#fef3c7] w-[221px] rounded-[13px]',
        markerText: 'hbuilderx-web-hmr-v4-step-3',
        cssContains: [/background-color:\s*#4338ca/, /color:\s*#fef3c7/, /width:\s*221px/, /border-radius:\s*13px/],
      },
    ],
  },
]
