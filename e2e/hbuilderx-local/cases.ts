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

export interface WebCase {
  name: string
  projectDir: string
  sourceFile: string
  markerAnchor: string
  markerClass: string
  markerText: string
  initialCssPath: string
  hmrCssPath: string
  initialCssContains: Array<string | RegExp>
  hmrCssContains: Array<string | RegExp>
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

export const webCases: WebCase[] = [
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
    sourceFile: 'pages/index/index.vue',
    markerAnchor: '<view class="text-[#888800]">',
    markerClass: 'bg-[#0f5132] text-[#f8fafc] w-[188px]',
    markerText: 'hbuilderx-web-hmr-v3',
    initialCssPath: '/main.css?direct',
    hmrCssPath: '/main.css?direct',
    initialCssContains: [/background-color:\s*rgb\(18 52 86/],
    hmrCssContains: [/background-color:\s*rgb\(15 81 50/, /color:\s*rgb\(248 250 252/, /width:\s*188px/],
  },
  {
    name: 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    projectDir: 'demo/uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    sourceFile: 'pages/index/index.vue',
    markerAnchor: '<view class="text-[#888800]">',
    markerClass: 'bg-[#0f5132] text-[#f8fafc] w-[188px]',
    markerText: 'hbuilderx-web-hmr-v4',
    initialCssPath: '/main.css?direct',
    hmrCssPath: '/main.css?direct',
    initialCssContains: [/background-color:\s*#123456/],
    hmrCssContains: [/background-color:\s*#0f5132/, /color:\s*#f8fafc/, /width:\s*188px/],
  },
]
