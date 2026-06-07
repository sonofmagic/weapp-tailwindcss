import process from 'node:process'

export const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/

export interface MiniProgramCase {
  name: string
  projectDir: string
  outputDir: string
  outputDirCandidates?: string[]
  cssFiles: string[]
  requiredFiles: string[]
  cssContains: Array<string | RegExp>
  cssNotContains?: Array<string | RegExp>
}

export type AppPlatform = 'app-android' | 'app-ios'

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
  hmrSteps: WebHmrStep[]
}

export interface WebHmrStep {
  markerClass: string
  markerText: string
  cssContains: Array<string | RegExp>
}

const hbuilderxMiniProgramOutputDirCandidates = [
  'unpackage/dist/dev/mp-weixin',
  'dist/dev/mp-weixin',
]

export const miniProgramCases: MiniProgramCase[] = [
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    outputDirCandidates: hbuilderxMiniProgramOutputDirCandidates,
    cssFiles: ['app.wxss'],
    requiredFiles: ['app.json'],
    cssContains: ['.bg-_b_h123456_B', /background-color:\s*rgba\(18,\s*52,\s*86/],
    cssNotContains: [rawTailwindDirectiveRE],
  },
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    outputDirCandidates: hbuilderxMiniProgramOutputDirCandidates,
    cssFiles: ['app.wxss'],
    requiredFiles: ['app.json'],
    cssContains: ['.bg-_b_h123456_B', 'background-color: #123456'],
    cssNotContains: [rawTailwindDirectiveRE],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v3',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    outputDirCandidates: hbuilderxMiniProgramOutputDirCandidates,
    cssFiles: ['app.wxss', 'pages/index/index.wxss'],
    requiredFiles: ['app.json', 'pages/index/index.json'],
    cssContains: ['.bg-_b_hf21903_B', '.text-_b_hda0e3c_B', '.w-64'],
    cssNotContains: [rawTailwindDirectiveRE],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    outputDirCandidates: hbuilderxMiniProgramOutputDirCandidates,
    cssFiles: ['app.wxss', 'pages/index/index.wxss'],
    requiredFiles: ['app.json', 'pages/index/index.json'],
    cssContains: ['.bg-_b_hf21903_B', '.text-_b_hda0e3c_B', '.w-64'],
    cssNotContains: [rawTailwindDirectiveRE],
  },
]

const defaultAndroidLaunchArgs = ['--deviceId', process.env['E2E_HBUILDERX_ANDROID_DEVICE_ID'] ?? 'emulator-5554']
const defaultIosLaunchArgs = ['--iosTarget', process.env['E2E_HBUILDERX_IOS_TARGET'] ?? 'simulator']

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
  const transformedClassNames = ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B']
  const hmrTransformedClassNames = ['bg-_b_h3b0764_B', 'text-_b_hfef08a_B', 'h-_b41px_B', 'mt-_b19px_B']

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
    }
  }

  return [
    createCase('app-android', 'android'),
    createCase('app-ios', 'ios'),
  ] satisfies AppCase[]
}

export const uniAppAppCases: AppCase[] = [
  ...createUniAppAppCases({
    name: 'uni-app-vite-tailwindcss-v3',
    projectDir: 'demo/uni-app-vite-tailwindcss-v3',
    sourceFile: 'src/pages/index/index.vue',
    markerAnchor: '<Issue228 class=',
    version: 'v3',
    launchEnv: {
      UNI_INPUT_DIR: 'src',
    },
    transformedFiles: [],
    transformedOutputFiles: ['app-service.js', 'app.css'],
  }),
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
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    sourceFile: 'pages/index/index.vue',
    markerAnchor: '<view class="text-[#888800]">',
    markerAnchorCandidates: [
      '<view class="text-[#888800]">',
      '<view class="text-[red]">',
    ],
    version: 'v3',
    outputDir: 'unpackage/dist/dev/app',
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
    name: 'uni-app-x-hbuilderx-tailwindcss-v3 android',
    platform: 'app-android',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v3',
    outputDir: 'unpackage/dist/dev/app-android',
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    markerClass: 'bg-[#102938] text-[#f7fbff] w-[173px]',
    markerText: 'hbuilderx-app-dynamic-v3-android',
    hmrMarkerClass: 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]',
    hmrMarkerText: 'hbuilderx-app-hmr-v3-android',
    launchArgs: defaultAndroidLaunchArgs,
    requiredFiles: [
      'manifest.json',
      'components/BindClass/classes.dex',
      'components/WeappTailwindcss/classes.dex',
      'pages/index/index/classes.dex',
    ],
    transformedFiles: [
      'unpackage/dist/dev/.uvue/app-android/pages/index/index.uvue',
    ],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B', 'hbuilderx-app-dynamic-v3-android'],
    hmrTransformedContains: ['bg-_b_h3b0764_B', 'text-_b_hfef08a_B', 'h-_b41px_B', 'mt-_b19px_B', 'hbuilderx-app-hmr-v3-android'],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v3 ios',
    platform: 'app-ios',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v3',
    outputDir: 'unpackage/dist/dev/app-ios',
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    markerClass: 'bg-[#102938] text-[#f7fbff] w-[173px]',
    markerText: 'hbuilderx-app-dynamic-v3-ios',
    hmrMarkerClass: 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]',
    hmrMarkerText: 'hbuilderx-app-hmr-v3-ios',
    launchArgs: defaultIosLaunchArgs,
    requiredFiles: [
      'manifest.json',
    ],
    transformedFiles: [
      'unpackage/cache/.app-ios/sourcemap/app-service.js.map',
    ],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B', 'hbuilderx-app-dynamic-v3-ios'],
    hmrTransformedContains: ['bg-_b_h3b0764_B', 'text-_b_hfef08a_B', 'h-_b41px_B', 'mt-_b19px_B', 'hbuilderx-app-hmr-v3-ios'],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4 android',
    platform: 'app-android',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/app-android',
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    markerClass: 'bg-[#102938] text-[#f7fbff] w-[173px]',
    markerText: 'hbuilderx-app-dynamic-v4-android',
    hmrMarkerClass: 'bg-[#3b0764] text-[#fef08a] h-[41px] mt-[19px]',
    hmrMarkerText: 'hbuilderx-app-hmr-v4-android',
    launchArgs: defaultAndroidLaunchArgs,
    requiredFiles: [
      'manifest.json',
      'components/BindClass/classes.dex',
      'components/WeappTailwindcss/classes.dex',
      'pages/index/index/classes.dex',
    ],
    transformedFiles: [
      'unpackage/dist/dev/.uvue/app-android/pages/index/index.uvue',
    ],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B', 'hbuilderx-app-dynamic-v4-android'],
    hmrTransformedContains: ['bg-_b_h3b0764_B', 'text-_b_hfef08a_B', 'h-_b41px_B', 'mt-_b19px_B', 'hbuilderx-app-hmr-v4-android'],
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
]

export const webCases: WebCase[] = [
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    sourceFile: 'pages/index/index.vue',
    markerAnchor: '<view class="text-[#888800]">',
    markerAnchorCandidates: [
      '<view class="text-[#888800]">',
      '<view class="text-[red]">',
    ],
    initialCssPath: '/main.css?direct',
    hmrCssPath: '/main.css?direct',
    initialCssContains: [/background-color:\s*rgb\(18 52 86/],
    hmrSteps: [
      {
        markerClass: 'bg-[#0f5132] text-[#f8fafc] w-[188px]',
        markerText: 'hbuilderx-web-hmr-v3-step-1',
        cssContains: [/background-color:\s*rgb\(15 81 50/, /color:\s*rgb\(248 250 252/, /width:\s*188px/],
      },
      {
        markerClass: 'bg-[#7c2d12] text-[#ecfeff] h-[37px] mt-[11px]',
        markerText: 'hbuilderx-web-hmr-v3-step-2',
        cssContains: [/background-color:\s*rgb\(124 45 18/, /color:\s*rgb\(236 254 255/, /height:\s*37px/, /margin-top:\s*11px/],
      },
      {
        markerClass: 'bg-[#4338ca] text-[#fef3c7] w-[221px] rounded-[13px]',
        markerText: 'hbuilderx-web-hmr-v3-step-3',
        cssContains: [/background-color:\s*rgb\(67 56 202/, /color:\s*rgb\(254 243 199/, /width:\s*221px/, /border-radius:\s*13px/],
      },
    ],
  },
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
    name: 'uni-app-x-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v3',
    sourceFile: 'pages/index/index.uvue',
    markerAnchor: '<BindClass />',
    initialCssPath: '/App.uvue?vue&type=style&index=0&lang.scss',
    hmrCssPath: '/App.uvue?vue&type=style&index=0&lang.scss',
    initialCssContains: ['.w-32', '.rounded-md', /background-color:\s*rgb\(242 25 3/],
    hmrSteps: [
      {
        markerClass: 'bg-[#0f5132] text-[#f8fafc] w-[188px]',
        markerText: 'hbuilderx-web-hmr-v3-step-1',
        cssContains: [/background-color:\s*rgb\(15 81 50/, /color:\s*rgb\(248 250 252/, /width:\s*188px/],
      },
      {
        markerClass: 'bg-[#7c2d12] text-[#ecfeff] h-[37px] mt-[11px]',
        markerText: 'hbuilderx-web-hmr-v3-step-2',
        cssContains: [/background-color:\s*rgb\(124 45 18/, /color:\s*rgb\(236 254 255/, /height:\s*37px/, /margin-top:\s*11px/],
      },
      {
        markerClass: 'bg-[#4338ca] text-[#fef3c7] w-[221px] rounded-[13px]',
        markerText: 'hbuilderx-web-hmr-v3-step-3',
        cssContains: [/background-color:\s*rgb\(67 56 202/, /color:\s*rgb\(254 243 199/, /width:\s*221px/, /border-radius:\s*13px/],
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
    initialCssContains: ['@layer theme', '--text-xl', '--color-white'],
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
