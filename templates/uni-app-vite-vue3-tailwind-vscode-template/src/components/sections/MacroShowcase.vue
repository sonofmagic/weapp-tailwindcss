<script setup lang="ts">
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
    <view class="text-xs uppercase tracking-[6rpx] text-slate-400">
      条件编译
    </view>
    <view class="text-2xl font-semibold text-slate-900">
      css-macro 语法在模板中的实际效果
    </view>
    <view class="mt-4 space-y-4">
      <view class="text-sm text-neutral-600">
        依赖 weapp-tailwindcss/css-macro 进行条件编译
      </view>
      <view
        class="
          rounded-[24rpx] border border-dashed border-slate-200 bg-slate-50/80
          p-4 text-sm text-slate-600
        "
      >
        <view class="mb-2 text-neutral-400">
          样式的条件编译
          <text
            class="text-sky-400 underline"
            @click="copy('https://tw.icebreaker.top/docs/quick-start/uni-app-css-macro')"
          >
            weapp-tailwindcss/css-macro
          </text>
        </view>
        <view
          class="
            rounded-xl px-3 py-2 text-white
            ifdef-[MP-WEIXIN]:bg-blue-500
            ifndef-[MP-WEIXIN]:bg-red-500
          "
        >
          微信小程序为蓝色，不是微信小程序为红色
        </view>

        <view
          class="
            mt-3 rounded-xl px-3 py-2 text-white
            wx:bg-blue-500
            -wx:bg-red-500
          "
        >
          <view>自定义配置的方式进行样式条件编译</view>
          <view>相关配置见根目录下的 tailwind.config.ts</view>
        </view>

        <view class="mt-3 rounded-xl bg-white/60 px-3 py-2 text-slate-700">
          <view class="apply-class-0">
            @apply 条件编译方式0
          </view>
          <view class="apply-class-1">
            @apply 条件编译方式1
          </view>
        </view>
      </view>
    </view>

    <view
      class="
        mt-4 rounded-[24rpx] border border-slate-200/80 bg-white/60 p-4
        shadow-inner
      "
    >
      <view class="text-sm font-semibold text-slate-700">
        更多文档
      </view>
      <view class="text-xs text-slate-500">
        点击复制链接
      </view>
      <view class="mt-3 flex flex-wrap gap-2 text-xs">
        <view
          class="
            rounded-full bg-slate-900/5 px-3 py-1 font-semibold text-slate-600
          "
          @click="copy('https://tw.icebreaker.top/')"
        >
          官网
        </view>
        <view
          class="
            rounded-full bg-slate-900/5 px-3 py-1 font-semibold text-slate-600
          "
          @click="copy('https://tw.icebreaker.top/docs/guide')"
        >
          Guide
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.apply-class-0 {
  @apply ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500;
}

.apply-class-1 {
  @apply wx:bg-blue-500 -wx:bg-red-500;
}
</style>
