export interface TaroWebHmrCase {
  name: string
  projectDir: string
  sourceFile: string
  assertion: 'css' | 'dom'
  appConfigProbe: boolean
  cssPaths?: string[]
  markerAttr: string
  markerText: string
  anchors: string[]
  insertion: string
}

function reactCase(options: {
  name: string
  projectDir: string
  sourceFile?: string
  markerAttr: string
  markerText: string
  anchors: string[]
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
    name: 'taro vite react Tailwind v3',
    projectDir: 'demo/taro-vite-react-tailwindcss-v3',
    markerAttr: 'vite-react-v3',
    markerText: 'TARO-WEB-HMR-VITE-REACT-V3',
    anchors: [
      '<View className=\'bg-[red] flex flex-col\'>',
    ],
  }),
  reactCase({
    name: 'taro vite react Tailwind v4',
    projectDir: 'demo/taro-vite-react-tailwindcss-v4',
    markerAttr: 'vite-react-v4',
    markerText: 'TARO-WEB-HMR-VITE-REACT-V4',
    anchors: [
      '<div className=\'h-[300px] text-[#c31d6b] bg-[#123456]\'>',
    ],
  }),
  vueCase({
    name: 'taro vite vue3 Tailwind v3',
    projectDir: 'demo/taro-vite-vue3-tailwindcss-v3',
    markerAttr: 'vite-vue3-v3',
    markerText: 'TARO-WEB-HMR-VITE-VUE3-V3',
    anchors: [
      '<view class="bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]">',
      '<view class="index">',
    ],
    cssPaths: ['/app.scss'],
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
    name: 'taro webpack react Tailwind v3',
    projectDir: 'demo/taro-webpack-react-tailwindcss-v3',
    markerAttr: 'webpack-react-v3',
    markerText: 'TARO-WEB-HMR-WEBPACK-REACT-V3',
    anchors: [
      '<View className=\'relative h-12 w-12 before:absolute before:inset-0 before:border-2 before:border-[#4bd650] rounded-[20rpx] before:rounded-[20rpx]\' />',
    ],
  }),
  reactCase({
    name: 'taro webpack react Tailwind v4',
    projectDir: 'demo/taro-webpack-react-tailwindcss-v4',
    markerAttr: 'webpack-react-v4',
    markerText: 'TARO-WEB-HMR-WEBPACK-REACT-V4',
    anchors: [
      '<View className=\'bg-[#534312] text-[#fff] text-[100rpx]\'>',
    ],
  }),
  vueCase({
    name: 'taro webpack vue3 Tailwind v3',
    projectDir: 'demo/taro-webpack-vue3-tailwindcss-v3',
    markerAttr: 'webpack-vue3-v3',
    markerText: 'TARO-WEB-HMR-WEBPACK-VUE3-V3',
    anchors: [
      '<view class="bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]">',
      '<view>',
    ],
    cssPaths: ['/app.less', '/app.scss', '/app.css'],
  }),
  vueCase({
    name: 'taro webpack vue3 Tailwind v4',
    projectDir: 'demo/taro-webpack-vue3-tailwindcss-v4',
    markerAttr: 'webpack-vue3-v4',
    markerText: 'TARO-WEB-HMR-WEBPACK-VUE3-V4',
    anchors: [
      '<view class="bg-[#534312] text-[#fff] text-[100rpx]">',
    ],
    cssPaths: ['/app.css'],
  }),
]

export const taroWebHmrCaseNames = taroWebHmrCases.map(item => item.name)
