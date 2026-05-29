import process from 'node:process'

export const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/

export interface MiniProgramCase {
  name: string
  projectDir: string
  outputDir: string
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
  sourceFile: string
  markerAnchor: string
  markerClass: string
  markerText: string
  launchArgs?: string[]
  requiredFiles: string[]
  transformedFiles: string[]
  transformedContains: Array<string | RegExp>
}

export interface WebCase {
  name: string
  projectDir: string
  sourceFile: string
  markerAnchor: string
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

export const miniProgramCases: MiniProgramCase[] = [
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    cssFiles: ['app.wxss'],
    requiredFiles: ['app.json'],
    cssContains: ['.bg-_b_h123456_B', /background-color:\s*rgba\(18,\s*52,\s*86/],
    cssNotContains: [rawTailwindDirectiveRE],
  },
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    cssFiles: ['app.wxss'],
    requiredFiles: ['app.json'],
    cssContains: ['.bg-_b_h123456_B', 'background-color: #123456'],
    cssNotContains: [rawTailwindDirectiveRE],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v3',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    cssFiles: ['app.wxss'],
    requiredFiles: ['app.json', 'pages/index/index.json'],
    cssContains: ['.bg-_b_hf21903_B', '.text-_b_hda0e3c_B', '.w-64'],
    cssNotContains: [rawTailwindDirectiveRE],
  },
  {
    name: 'uni-app-x-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-x-hbuilderx-tailwindcss-v4',
    outputDir: 'unpackage/dist/dev/mp-weixin',
    cssFiles: ['app.wxss'],
    requiredFiles: ['app.json', 'pages/index/index.json'],
    cssContains: ['.bg-_b_hf21903_B', '.text-_b_hda0e3c_B', '.w-64'],
    cssNotContains: [rawTailwindDirectiveRE],
  },
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
    launchArgs: ['--deviceId', process.env['E2E_HBUILDERX_ANDROID_DEVICE_ID'] ?? 'emulator-5554'],
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
    launchArgs: ['--iosTarget', process.env['E2E_HBUILDERX_IOS_TARGET'] ?? 'simulator'],
    requiredFiles: [
      'manifest.json',
    ],
    transformedFiles: [
      'unpackage/cache/.app-ios/sourcemap/app-service.js.map',
    ],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B', 'hbuilderx-app-dynamic-v3-ios'],
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
    launchArgs: ['--deviceId', process.env['E2E_HBUILDERX_ANDROID_DEVICE_ID'] ?? 'emulator-5554'],
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
    launchArgs: ['--iosTarget', process.env['E2E_HBUILDERX_IOS_TARGET'] ?? 'simulator'],
    requiredFiles: [
      'manifest.json',
    ],
    transformedFiles: [
      'unpackage/dist/dev/app-ios/app-service.js',
    ],
    transformedContains: ['bg-_b_h102938_B', 'text-_b_hf7fbff_B', 'w-_b173px_B', 'hbuilderx-app-dynamic-v4-ios'],
  },
]

export const webCases: WebCase[] = [
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    sourceFile: 'pages/index/index.vue',
    markerAnchor: '<view class="text-[#888800]">',
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
]
