export const FRAMEWORK_CASES = [
  {
    key: 'uni-app-vue3',
    label: 'uni-app vue3',
    project: 'benchmark/framework-compare/projects/uni-app-vue3',
    sourceProject: 'demo/uni-app-vue3-vite',
    buildScript: 'build',
    devScript: 'dev:mp-weixin',
    runtimeRefPackage: 'vue',
    hmrSourceFile: 'src/pages/index/index.vue',
    hmrOutputFile: 'dist/dev/mp-weixin/pages/index/index.wxml',
    buildOutputFile: 'dist/build/mp-weixin/pages/index/index.wxml',
    mutateSource: injectIntoVueTemplate,
  },
  {
    key: 'taro-vue3',
    label: 'taro vue3',
    project: 'benchmark/framework-compare/projects/taro-vue3',
    sourceProject: 'demo/taro-vue3-app',
    buildScript: 'build',
    devScript: 'dev:weapp',
    runtimeRefPackage: 'vue',
    hmrSourceFile: 'src/pages/index/index.vue',
    hmrOutputFile: 'dist/pages/index/index.js',
    mutateSource: injectIntoVueTemplate,
  },
  {
    key: 'weapp-vite-wevu',
    label: 'weapp-vite wevu',
    project: 'benchmark/framework-compare/projects/weapp-vite-wevu',
    sourceProject: 'apps/vite-native-ts-skyline',
    buildScript: 'build',
    devScript: 'dev',
    runtimeRefPackage: 'wevu',
    hmrSourceFile: 'miniprogram/pages/cart/index.vue',
    hmrOutputFile: 'dist/pages/cart/index.wxml',
    mutateSource: injectIntoVueTemplate,
  },
]

export const CONTROLLED_VUE_SFC_SOURCE = `<template>
  <view class="tw-framework-bench-root">
    <view class="text-[18px] h-[40px] w-[120px] bg-[#123456]">framework-bench</view>
    <view class="tw-framework-bench-anchor">anchor</view>
  </view>
</template>

<script setup lang="ts">
</script>

<style>
.tw-framework-bench-root {
  padding: 24rpx;
}
</style>
`

export function createScenario(seed) {
  const marker = `tw-framework-bench-${seed}`
  const classLiteral = [
    `text-[23.${seed}px]`,
    'space-y-2.5',
    `w-[calc(100%_-_${seed}px)]`,
    `grid-cols-[200rpx_minmax(900rpx,_1fr)_${seed}px]`,
    `after:ml-[0.${seed}px]`,
    'text-black/[0.92]',
    'ring-[1.1px]',
    '!mt-2',
    '-translate-y-1',
    'max-[712px]:p-[13px]',
    'bg-[rgb(12,34,56)]',
    'data-[state=open]:opacity-100',
    'supports-[display:grid]:grid',
    '[mask-type:luminance]',
  ].join(' ')
  return {
    marker,
    classLiteral,
  }
}

function injectIntoVueTemplate(source, payload) {
  const closingTag = '</template>'
  const index = source.lastIndexOf(closingTag)
  if (index === -1) {
    throw new Error('vue template closing tag not found')
  }
  const snippet = `\n  <view class="${payload.classLiteral}">${payload.marker}</view>\n`
  return `${source.slice(0, index)}${snippet}${source.slice(index)}`
}
