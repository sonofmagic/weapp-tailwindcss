<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
const { count } = storeToRefs(store)
const { increment } = store
const buttonColors = [
  'bg-[#000]',
  'bg-[#111]',
  'bg-[#222]',
  'bg-[#333]',
  'bg-[#444]',
  'bg-[#555]',
  'bg-[#666]',
  'bg-[#777]',
  'bg-[#888]',
  'bg-[#999]',
  'bg-[#aaa]',
  'bg-[#bbb]',
  'bg-[#ccc]',
  'bg-[#ddd]',
  'bg-[#eee]',
  'bg-[#fff]',
]
const buttonPalette = buttonColors.map((color, index) => ({
  bg: color,
  tone: index < 8 ? 'dark' : 'light',
}))
const buttonClass = computed(() => {
  const palette = buttonPalette[count.value % buttonPalette.length]
  if (palette.tone === 'dark') {
    return [palette.bg, 'text-white ring-1 ring-white/20']
  }

  return [
    palette.bg,
    'text-slate-900 ring-2 ring-slate-200/80 hover:ring-slate-300/80',
  ]
})
const themeRef = ref(uni.getSystemInfoSync().theme)
const themeLabel = computed(() => (themeRef.value === 'dark' ? '暗色主题' : '浅色主题'))
const proTips = [
  {
    title: 'pseudo + hover',
    detail: 'after:content-[\'hover_here!\'] + hover-class',
  },
  {
    title: '@apply',
    detail: 'test / apply-class-0 / apply-class-1 支持宏组合',
  },
  {
    title: 'Grid + Icon',
    detail: '[&_text]:text-[32px] + iconify i-* 系列',
  },
]

let themeChangeHandler: ((options: { theme: 'dark' | 'light' }) => void) | null = null

// #ifdef MP
function registerThemeChange() {
  themeChangeHandler = ({ theme }: { theme: 'dark' | 'light' }) => {
    themeRef.value = theme
  }
  uni.onThemeChange(themeChangeHandler)
}

registerThemeChange()
// #endif

onBeforeUnmount(() => {
  // #ifdef MP
  if (themeChangeHandler) {
    uni.offThemeChange(themeChangeHandler)
    themeChangeHandler = null
  }
  // #endif
})

function copy(data: string) {
  uni.setClipboardData({
    data,
  })
}
</script>

<template>
  <view
    class="
      rounded-[32rpx] border border-slate-100/70 bg-white/90 p-5
      shadow-[0_20px_45px_rgba(15,23,42,0.08)]
    "
  >
    <view class="flex flex-col gap-2">
      <view class="text-xs uppercase tracking-[6rpx] text-slate-400">
        即时体验
      </view>
      <view class="text-2xl font-semibold text-slate-900">
        Tailwind 原子能力搭配 Pinia/uni-api
      </view>
    </view>
    <view
      class="
        mt-4 flex flex-col gap-4
        lg:grid lg:grid-cols-3
      "
    >
      <view
        class="
          flex flex-col gap-3 rounded-[28rpx] border border-slate-200/80
          bg-gradient-to-br from-slate-900/95 to-slate-700/95 p-4 text-white
          shadow-xl
        "
      >
        <view class="text-xs uppercase tracking-[6rpx] text-white/60">
          动态配色按钮
        </view>
        <view class="text-3xl font-semibold">
          {{ count }}
        </view>
        <view class="text-xs text-white/70">
          buttonColors + computed + Pinia
        </view>
        <button
          class="
            w-full rounded-2xl py-2 text-base font-semibold shadow-lg transition
            hover:scale-[1.01]
          "
          :class="buttonClass"
          @click="increment"
        >
          click to inc
        </button>
        <view class="text-xs text-white/70">
          任意色值 `bg-[#xxx]` + hover 保留
        </view>
        <view class="test">
          @apply + 自定义尺寸
        </view>
      </view>

      <view
        class="
          flex flex-col gap-3 rounded-[28rpx] border border-slate-200/80
          bg-white/85 p-4 shadow-xl backdrop-blur-lg
        "
      >
        <view class="text-xs uppercase tracking-[6rpx] text-slate-500">
          theme 监听
        </view>
        <view class="text-3xl font-semibold text-slate-900">
          {{ themeLabel }}
        </view>
        <view class="text-xs text-slate-500">
          uni.onThemeChange -> ref / computed
        </view>
        <view
          class="
            mt-4 rounded-2xl border border-dashed border-slate-200
            bg-slate-50/70 p-3 text-[26rpx] text-slate-600
          "
        >
          themeRef: {{ themeRef }}
        </view>
        <view class="mt-4">
          <view class="text-sm font-semibold text-slate-600">
            weapp-tailwindcss/css-macro
          </view>
          <view class="text-xs text-slate-500">
            tailwind 语法条件编译
          </view>
          <view class="mt-2 flex flex-wrap gap-2 text-xs">
            <view
              class="
                rounded-full bg-slate-900/5 px-3 py-1 font-semibold
                text-slate-600
              "
              @click="copy('https://tw.icebreaker.top/docs/quick-start/uni-app-css-macro')"
            >
              点击复制文档
            </view>
          </view>
        </view>
      </view>

      <view
        class="
          flex flex-col gap-3 rounded-[28rpx] border border-slate-200/80
          bg-white/85 p-4 shadow-xl backdrop-blur-lg
        "
      >
        <view class="text-xs uppercase tracking-[6rpx] text-slate-500">
          hover + group + ring
        </view>
        <view class="text-sm text-slate-500">
          hover-class + group-[.published]
        </view>
        <view
          class="
            mt-3 flex h-16 w-32 items-center justify-center rounded-[20rpx]
            bg-[#389f2bb1] text-white
            after:content-['hover_here!']
          "
          hover-class="!bg-[gray] after:!content-['good_work!']"
        />
        <view class="text-xs text-slate-500">
          pseudo + hover-class
        </view>
        <view class="mt-3 text-neutral-400">
          group published 示例
        </view>
        <view
          class="
            group relative rounded-2xl bg-green-200/70 p-[60px] text-xs
            text-slate-700
            before:absolute before:left-1 before:top-1 before:text-slate-500
            before:content-['父元素']
          "
          hover-class="published"
        >
          <view
            class="
              rounded-xl bg-pink-400/80 p-2 text-white ring-4 ring-pink-200
              group-[.published]:bg-yellow-400 group-[.published]:text-slate-800
            "
          >
            hover 父元素使得子元素背景变成黄色
          </view>
        </view>
      </view>
    </view>

    <view
      class="
        mt-5 flex flex-col gap-4
        md:grid md:grid-cols-2
      "
    >
      <view
        class="
          rounded-[26rpx] border border-slate-200/80 bg-white/70 p-4
          shadow-inner
        "
      >
        <view class="text-sm font-semibold text-slate-700">
          Tailwind ring + 自定义按钮
        </view>
        <view class="text-xs text-slate-500">
          ring utilities
        </view>
        <view
          class="
            mt-4 grid grid-cols-1 gap-3
            sm:grid-cols-2
          "
        >
          <view
            class="
              w-full rounded-md bg-pink-500 py-2 text-center font-semibold
              text-white ring-4 ring-pink-300
            "
          >
            Default Ring
          </view>
          <button class="btn">
            @layer 定制按钮
          </button>
        </view>
      </view>

      <view
        class="
          rounded-[26rpx] border border-slate-200/80 bg-white/70 p-4
          shadow-inner
        "
      >
        <view class="text-sm font-semibold text-slate-700">
          Pro tips
        </view>
        <view class="text-xs text-slate-500">
          结合 Icon、伪元素、Grid
        </view>
        <view class="mt-3 space-y-2">
          <view
            v-for="tip in proTips"
            :key="tip.title"
            class="
              rounded-2xl border border-slate-100/80 bg-slate-50/60 px-3 py-2
              text-[26rpx] text-slate-600
            "
          >
            <view class="font-semibold text-slate-700">
              {{ tip.title }}
            </view>
            <view class="text-slate-500">
              {{ tip.detail }}
            </view>
          </view>
        </view>
        <view class="mt-4 text-neutral-600 underline" @click="copy('https://tw.icebreaker.top/docs/icons')">
          Grid布局 + Icon 方案（点击复制链接）
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.test {
  @apply flex text-center h-[100px] w-[222.222px] items-center justify-center rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}
</style>
