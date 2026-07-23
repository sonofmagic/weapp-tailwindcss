import process from 'node:process'

export const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/
const unsafeMiniProgramSelectorFragments = ['.i-\\[', '.before\\:'] as const
const safeMiniProgramGeneratedSelectors = [
  '.i-_bmdi--github-circle_B',
  '.i-_bmdi--star_B',
  '.i-_bsvg-spinners--180-ring-with-bg_B',
  '.before_ccontent-',
] as const

export interface MiniProgramCase {
  name: string
  platform: MiniProgramPlatform
  projectDir: string
  outputDir: string
  outputDirCandidates?: string[]
  cssExtensions: string[]
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
  markerTextClass?: string
  markerText: string
  hmrMarkerClass: string
  hmrMarkerTextClass?: string
  hmrMarkerText: string
  launchArgs?: string[]
  launchEnv?: Record<string, string>
  requiredFiles: string[]
  transformedFiles?: string[]
  transformedOutputFiles?: string[]
  transformedContains: Array<string | RegExp>
  compiledStyleContains?: Array<string | RegExp>
  transformedNotContains?: Array<string | RegExp>
  hmrTransformedContains: Array<string | RegExp>
  styleOutputFiles?: string[]
  styleContains?: Array<string | RegExp>
  styleNotContains?: Array<string | RegExp>
  hmrStyleContains?: Array<string | RegExp>
  runtimeLogContains?: Array<string | RegExp>
  logNotContains?: Array<string | RegExp>
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
    cssExtensions: ['.acss'],
    outputDir: 'unpackage/dist/dev/mp-alipay',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.axml',
      independent: 'sub-independent/pages/index.axml',
      normal: 'sub-normal/pages/index.axml',
    },
  },
  'mp-baidu': {
    cssExtensions: ['.css'],
    outputDir: 'unpackage/dist/dev/mp-baidu',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.swan',
      independent: 'sub-independent/pages/index.swan',
      normal: 'sub-normal/pages/index.swan',
    },
  },
  'mp-toutiao': {
    cssExtensions: ['.ttss'],
    outputDir: 'unpackage/dist/dev/mp-toutiao',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.ttml',
      independent: 'sub-independent/pages/index.ttml',
      normal: 'sub-normal/pages/index.ttml',
    },
  },
  'mp-weixin': {
    cssExtensions: ['.wxss'],
    outputDir: 'unpackage/dist/dev/mp-weixin',
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    templateFiles: {
      main: 'pages/index/index.wxml',
      independent: 'sub-independent/pages/index.wxml',
      normal: 'sub-normal/pages/index.wxml',
    },
  },
} satisfies Record<MiniProgramPlatform, {
  cssExtensions: string[]
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
    ...safeMiniProgramGeneratedSelectors,
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
    cssExtensions: platformFiles.cssExtensions,
    requiredFiles: platformFiles.requiredFiles,
    cssContains: isTailwindV4
      ? tailwindV4CssContains
      : ['.bg-_b_h123456_B', /background-color:\s*rgba\(18,\s*52,\s*86/, /normal[-_]subpackage/i, /independent[-_]subpackage/i],
    cssNotContains: [rawTailwindDirectiveRE, ...unsafeMiniProgramSelectorFragments],
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
    cssExtensions: platformFiles.cssExtensions,
    requiredFiles: ['app.json', 'pages/index/index.json', 'sub-normal/pages/index.json', 'sub-independent/pages/index.json'],
    cssContains: [...safeMiniProgramGeneratedSelectors, '.bg-_b_h87add3_B', '.bg-_b_hd2e252_B', '.text-_b93_d54rpx_B', '.bg-_b_hf21903_B', '.text-_b_hda0e3c_B', '.w-64'],
    cssNotContains: [rawTailwindDirectiveRE, ...unsafeMiniProgramSelectorFragments],
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
const harmonyDeviceId = process.env['E2E_HBUILDERX_HARMONY_DEVICE_ID'] ?? process.env['DEMO_VISUAL_HARMONY_DEVICE_ID']
const defaultHarmonyLaunchArgs = harmonyDeviceId ? ['--deviceId', harmonyDeviceId] : []
const harmonyInitialTransformedContains = [
  '"backgroundColor":"#102938"',
  '"color":"#f7fbff"',
  '"width":173',
]
const harmonyHmrTransformedContains = [
  '"backgroundColor":"#3b0764"',
  '"color":"#fef08a"',
  '"height":41',
  '"marginTop":19',
]
const issue1002AppOutputNotContains = [
  '.tw-root',
  'calc(infinity',
  'var(--color-white)',
  /var\(--text-(?:xs|sm|base|xl)/,
  /calc\((?:1(?:\.\d+)?\s*\/|8rpx\s*\*)/,
]
const issue1002AppLogNotContains = [
  /unsupported utility:\s*tw-root/i,
  /calc\(infinity\s*\*\s*1px\)/i,
  /property value `calc\((?:1(?:\.\d+)?\s*\/|8rpx\s*\*)/i,
  /not supported for `border-(?:bottom|top)-(?:left|right)-radius`/i,
]
const issue1002HarmonyStyleNotContains = issue1002AppOutputNotContains
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
  styleOutputFiles?: string[]
  styleContains?: Array<string | RegExp>
  hmrStyleContains?: Array<string | RegExp>
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
    styleOutputFiles = ['app.css'],
    styleContains: extraStyleContains = [],
    hmrStyleContains: extraHmrStyleContains = [],
  } = options
  const markerClass = 'bg-[#102938] text-[#f7fbff] w-[173px]'
  const hmrMarkerClass = 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]'
  const transformedClassNames = ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B']
  const hmrTransformedClassNames = ['bg-_b_h3b0764_B', 'text-_b_hfef08a_B', 'h-_b41px_B', 'mt-_b19px_B']
  const styleContains = ['.bg-_b_h102938_B', '.text-_b_hf7fbff_B', '.w-_b173px_B', ...extraStyleContains]
  const hmrStyleContains = ['.bg-_b_h3b0764_B', '.text-_b_hfef08a_B', '.h-_b41px_B', '.mt-_b19px_B', ...extraHmrStyleContains]

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
      styleOutputFiles,
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
    markerAnchor: '<view class="special-class-visual-probe',
    version: 'v4',
    launchEnv: {
      UNI_INPUT_DIR: 'src',
    },
    transformedFiles: [],
    transformedOutputFiles: ['app-service.js', 'app.css'],
    styleOutputFiles: ['app.css', 'pages/index/index.css'],
    styleContains: [
      '.bg-white_f70',
      /background-color:\s*rgba\(255,\s*255,\s*255,\s*0\.7\)/,
      '.text-_b45rpx_B',
      '.dark_cbg-red-300',
      '.bg-_bradial-gradient_pcircle_at_18_v_20_v_m_he0f2fe_m_hfdf4ff_70_v_P_B',
      /background-image:\s*radial-gradient\(circle at 18% 20%,#e0f2fe,#fdf4ff 70%\)/,
      '.css-variable-visual-probe',
      '--visual-probe-bg: rgb(16, 185, 129)',
      'background-color: var(--visual-probe-bg)',
      'font-size: var(--visual-probe-size)',
    ],
    hmrStyleContains: [
      '.bg-white_f70',
      '.text-_b45rpx_B',
      '.dark_cbg-red-300',
      '.css-variable-visual-probe',
    ],
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
    sourceFile: 'components/BindClass.uvue',
    markerAnchor: '<text :class="flag',
    markerClass: 'flex h-[41px] w-[173px] items-center justify-center rounded-full bg-[#102938]',
    markerTextClass: 'text-xl text-white',
    markerText: 'hbuilderx-app-dynamic-v4-android',
    hmrMarkerClass: 'mt-[19px] flex h-[41px] w-[173px] items-center justify-center rounded-full bg-[#3b0764] [transform:translate(10px,20px)]',
    hmrMarkerTextClass: 'text-sm text-white',
    hmrMarkerText: 'hbuilderx-app-hmr-v4-android',
    launchArgs: defaultAndroidLaunchArgs,
    requiredFiles: [
      'App.uvue.ts',
      'components/BindClass.uvue.ts',
      'pages/index/index.uvue.ts',
    ],
    transformedOutputFiles: [
      'App.uvue.ts',
      'components/BindClass.uvue.ts',
      'pages/index/index.uvue.ts',
    ],
    transformedContains: ['hbuilderx-app-dynamic-v4-android'],
    compiledStyleContains: [
      'issue 822 component child',
      /\["wtu-[^"]+", _pS\(_uM\(\[\["width", "100%"\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["height", 200\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["backgroundColor", "#87add3"\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["color", "#111111"\]/,
      'issue-1002 text-xs',
      /\["wtu-[^"]+", _pS\(_uM\(\[\["fontSize", "24rpx"\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["fontSize", "28rpx"\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["fontSize", "32rpx"\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["fontSize", "40rpx"\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["color", "#ffffff"\]/,
      /\["wtu-[^"]+", _pS\(_uM\(\[\["borderTopLeftRadius", 9999\]/,
      '["issue-1002-apply", _pS(_uM([["borderTopLeftRadius", 9999]',
      '["lineHeight", 1.33333]',
    ],
    transformedNotContains: [
      ...issue1002AppOutputNotContains,
      /class: "[^"]*\btext-xs\b/,
      /class: "[^"]*\btext-white\b/,
      /class: "[^"]*\brounded-full\b/,
    ],
    hmrTransformedContains: [
      'hbuilderx-app-hmr-v4-android',
      /\["backgroundColor", "#3b0764"\]/,
      /\["fontSize", "28rpx"\]/,
      /\["height", 41\]/,
      /\["marginTop", 19\]/,
      /\["WebkitTransform", "translate\(10px 20px\)"\]/,
      /\["transform", "translate\(10px 20px\)"\]/,
    ],
    runtimeLogContains: ['App Launch'],
    logNotContains: [
      ...issue1002AppLogNotContains,
      /property value .*translate.*not supported for .*transform/i,
    ],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4 ios',
    platform: 'app-ios',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/app-ios',
    sourceFile: 'components/BindClass.uvue',
    markerAnchor: '<text :class="flag',
    markerClass: 'flex h-[41px] w-[173px] items-center justify-center rounded-full bg-[#102938]',
    markerTextClass: 'text-xl text-white',
    markerText: 'hbuilderx-app-dynamic-v4-ios',
    hmrMarkerClass: 'mt-[19px] flex h-[41px] w-[173px] items-center justify-center rounded-full bg-[#3b0764]',
    hmrMarkerTextClass: 'text-sm text-white',
    hmrMarkerText: 'hbuilderx-app-hmr-v4-ios',
    launchArgs: defaultIosLaunchArgs,
    requiredFiles: [
      'manifest.json',
    ],
    transformedFiles: [
      'unpackage/dist/dev/app-ios/app-service.js',
    ],
    transformedContains: [
      'bg-_b_h102938_B',
      'text-_b_hf7fbff_B',
      'w-_b173px_B',
      'hbuilderx-app-dynamic-v4-ios',
      'issue 822 component child',
      /"width"\s*:\s*"100%"/,
      /"height"\s*:\s*200/,
      /"backgroundColor"\s*:\s*"#87add3"/,
      /"color"\s*:\s*"#111111"/,
    ],
    transformedNotContains: issue1002AppOutputNotContains,
    hmrTransformedContains: ['bg-_b_h3b0764_B', 'text-_b_hfef08a_B', 'h-_b41px_B', 'mt-_b19px_B', 'hbuilderx-app-hmr-v4-ios'],
    runtimeLogContains: ['App Launch'],
    logNotContains: issue1002AppLogNotContains,
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
    markerClass: 'flex h-[41px] w-[173px] items-center justify-center rounded-full bg-[#102938]',
    markerTextClass: 'text-xl text-white text-[#f7fbff]',
    markerText: 'hbuilderx-app-dynamic-v4-harmony',
    hmrMarkerClass: 'mt-[19px] flex h-[41px] w-[173px] items-center justify-center rounded-full bg-[#3b0764]',
    hmrMarkerTextClass: 'text-sm text-white text-[#fef08a]',
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
    transformedNotContains: ['.tw-root'],
    styleOutputFiles: [
      'pages/index/index.uvue',
      'uni-app-x-harmony-apply.css',
    ],
    styleContains: [
      /\.issue-1002-apply\s*\{[\s\S]*border-radius:\s*9999px/,
      /\.rounded-full\s*\{[\s\S]*border-radius:\s*9999px/,
      /\.text-xs\s*\{[\s\S]*font-size:\s*24rpx/,
      /\.text-sm\s*\{[\s\S]*font-size:\s*28rpx/,
      /\.text-base\s*\{[\s\S]*font-size:\s*32rpx/,
      /\.text-xl\s*\{[\s\S]*font-size:\s*40rpx/,
      /\.text-white\s*\{[\s\S]*color:\s*#fff(?:fff)?/,
    ],
    styleNotContains: issue1002HarmonyStyleNotContains,
    hmrTransformedContains: [...harmonyHmrTransformedContains, 'hbuilderx-app-hmr-v4-harmony'],
    runtimeLogContains: ['App Launch'],
    logNotContains: issue1002AppLogNotContains,
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
        markerClass: 'hbuilderx-web-hmr-probe bg-[#0f5132] text-[#f8fafc] w-[188px]',
        markerText: 'hbuilderx-web-hmr-v4-step-1',
        cssContains: [/background-color:\s*#0f5132/, /color:\s*#f8fafc/, /width:\s*188px/],
        runtimeStyles: [{
          selector: '.hbuilderx-web-hmr-probe',
          styles: { backgroundColor: 'rgb(15, 81, 50)', color: 'rgb(248, 250, 252)', width: '188px' },
        }],
      },
      {
        markerClass: 'hbuilderx-web-hmr-probe bg-[#7c2d12] text-[#ecfeff] h-[37px] mt-[11px]',
        markerText: 'hbuilderx-web-hmr-v4-step-2',
        cssContains: [/background-color:\s*#7c2d12/, /color:\s*#ecfeff/, /height:\s*37px/, /margin-top:\s*11px/],
        runtimeStyles: [{
          selector: '.hbuilderx-web-hmr-probe',
          styles: { backgroundColor: 'rgb(124, 45, 18)', color: 'rgb(236, 254, 255)', height: '37px', marginTop: '11px' },
        }],
      },
      {
        markerClass: 'hbuilderx-web-hmr-probe bg-[#4338ca] text-[#fef3c7] w-[221px] rounded-[13px]',
        markerText: 'hbuilderx-web-hmr-v4-step-3',
        cssContains: [/background-color:\s*#4338ca/, /color:\s*#fef3c7/, /width:\s*221px/, /border-radius:\s*13px/],
        runtimeStyles: [{
          selector: '.hbuilderx-web-hmr-probe',
          styles: { backgroundColor: 'rgb(67, 56, 202)', borderRadius: '13px', color: 'rgb(254, 243, 199)', width: '221px' },
        }],
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
    initialCssContains: [/uni-page-body,\s*\.tw-root,\s*wx-root-portal-content,\s*:host/, '--text-xl', '--color-white', /background-color:\s*#f21903/, 'weapp-tailwindcss uni-app-x web preflight reset', 'uni-app uni-view'],
    initialRuntimeStyles: [
      {
        selector: 'uni-app uni-view',
        styles: {
          borderBottomWidth: '0px',
          borderLeftWidth: '0px',
          borderRightWidth: '0px',
          borderTopWidth: '0px',
        },
      },
    ],
    workflow: uniAppXHBuilderXWorkflow,
    hmrSteps: [
      {
        markerClass: 'hbuilderx-web-hmr-probe bg-[#0f5132] text-[#f8fafc] w-[188px]',
        markerText: 'hbuilderx-web-hmr-v4-step-1',
        cssContains: [/background-color:\s*#0f5132/, /color:\s*#f8fafc/, /width:\s*188px/],
        runtimeStyles: [{
          selector: '.hbuilderx-web-hmr-probe',
          styles: { backgroundColor: 'rgb(15, 81, 50)', color: 'rgb(248, 250, 252)', width: '188px' },
        }],
      },
      {
        markerClass: 'hbuilderx-web-hmr-probe bg-[#7c2d12] text-[#ecfeff] h-[37px] mt-[11px]',
        markerText: 'hbuilderx-web-hmr-v4-step-2',
        cssContains: [/background-color:\s*#7c2d12/, /color:\s*#ecfeff/, /height:\s*37px/, /margin-top:\s*11px/],
        runtimeStyles: [{
          selector: '.hbuilderx-web-hmr-probe',
          styles: { backgroundColor: 'rgb(124, 45, 18)', color: 'rgb(236, 254, 255)', height: '37px', marginTop: '11px' },
        }],
      },
      {
        markerClass: 'hbuilderx-web-hmr-probe bg-[#4338ca] text-[#fef3c7] w-[221px] rounded-[13px]',
        markerText: 'hbuilderx-web-hmr-v4-step-3',
        cssContains: [/background-color:\s*#4338ca/, /color:\s*#fef3c7/, /width:\s*221px/, /border-radius:\s*13px/],
        runtimeStyles: [{
          selector: '.hbuilderx-web-hmr-probe',
          styles: { backgroundColor: 'rgb(67, 56, 202)', borderRadius: '13px', color: 'rgb(254, 243, 199)', width: '221px' },
        }],
      },
      {
        markerClass: 'hbuilderx-web-hmr-probe bg-[#0e7490] mt-[10rpx] text-xs',
        markerText: 'hbuilderx-web-hmr-v4-rem-rpx',
        cssContains: [/background-color:\s*#0e7490/, /\.mt-_b10rpx_B\s*\{[\s\S]*margin-top:\s*0\.3125rem/, /\.text-xs\s*\{[\s\S]*font-size:\s*0\.75rem/],
        runtimeStyles: [{
          selector: '.hbuilderx-web-hmr-probe',
          styles: { backgroundColor: 'rgb(14, 116, 144)', fontSize: '12px', marginTop: '5px' },
        }],
      },
    ],
  },
]
