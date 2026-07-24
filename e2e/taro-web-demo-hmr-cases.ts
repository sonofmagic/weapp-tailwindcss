export interface TaroWebHmrCase {
  name: string
  projectDir: string
  sourceFile: string
  cssEntryFile?: string
  assertion: 'css' | 'dom'
  appConfigProbe: boolean
  cssPaths?: string[]
  markerAttr: string
  markerText: string
  anchors: string[]
  insertion: string
  issue850ImportOrder?: 'nutui-first' | 'tailwind-first'
}

function reactCase(options: {
  name: string
  projectDir: string
  sourceFile?: string
  cssEntryFile?: string
  markerAttr: string
  markerText: string
  anchors: string[]
  issue850ImportOrder?: 'nutui-first' | 'tailwind-first'
}): TaroWebHmrCase {
  return {
    ...options,
    assertion: 'dom',
    appConfigProbe: !options.name.includes('webpack'),
    sourceFile: options.sourceFile ?? 'src/pages/index/index.tsx',
    insertion: `      <View data-taro-web-hmr="${options.markerAttr}" className="text-[#ff0000]">${options.markerText}</View>`,
  }
}

function vueCase(options: {
  name: string
  projectDir: string
  sourceFile?: string
  cssEntryFile?: string
  markerAttr: string
  markerText: string
  anchors: string[]
  cssPaths: string[]
}): TaroWebHmrCase {
  return {
    ...options,
    assertion: options.name.includes('webpack') ? 'dom' : 'css',
    appConfigProbe: !options.name.includes('webpack'),
    sourceFile: options.sourceFile ?? 'src/pages/index/index.vue',
    insertion: `    <view data-taro-web-hmr="${options.markerAttr}" class="text-[#ff0000]">${options.markerText}</view>`,
  }
}

export const taroWebHmrCases: TaroWebHmrCase[] = [
  reactCase({
    name: 'taro vite react Tailwind v4',
    projectDir: 'demo/taro-vite-react-tailwindcss-v4',
    markerAttr: 'vite-react-v4',
    markerText: 'TARO-WEB-HMR-VITE-REACT-V4',
    issue850ImportOrder: 'tailwind-first',
    anchors: [
      '<div className=\'h-[300px] text-[#c31d6b] bg-[#123456]\'>',
    ],
  }),
  vueCase({
    name: 'taro vite vue3 Tailwind v4',
    projectDir: 'demo/taro-vite-vue3-tailwindcss-v4',
    markerAttr: 'vite-vue3-v4',
    markerText: 'TARO-WEB-HMR-VITE-VUE3-V4',
    anchors: [
      '<view class="h-[300px] text-[#c31d6b] bg-[#123456]">',
    ],
    cssPaths: ['/app.css'],
  }),
  reactCase({
    name: 'taro webpack react Tailwind v4',
    projectDir: 'demo/taro-webpack-react-tailwindcss-v4',
    cssEntryFile: 'src/app.css',
    markerAttr: 'webpack-react-v4',
    markerText: 'TARO-WEB-HMR-WEBPACK-REACT-V4',
    issue850ImportOrder: 'nutui-first',
    anchors: [
      '<View className=\'bg-[#534312] text-[#fff] text-[100rpx]\'>',
    ],
  }),
  vueCase({
    name: 'taro webpack vue3 Tailwind v4',
    projectDir: 'demo/taro-webpack-vue3-tailwindcss-v4',
    cssEntryFile: 'src/app.css',
    markerAttr: 'webpack-vue3-v4',
    markerText: 'TARO-WEB-HMR-WEBPACK-VUE3-V4',
    anchors: [
      '<view class="bg-[#534312] text-[#fff] text-[100rpx]">',
    ],
    cssPaths: ['/app.css'],
  }),
]

export const taroWebHmrCaseNames = taroWebHmrCases.map(item => item.name)
