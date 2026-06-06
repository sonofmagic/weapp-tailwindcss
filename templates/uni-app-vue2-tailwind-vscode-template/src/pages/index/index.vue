<template>
  <view class="min-h-screen bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[32rpx] py-[40rpx] text-slate-800">
    <view class="rounded-[32rpx] border border-slate-100/70 bg-white/90 p-[40rpx] shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">
        Uni App Vue2 · Tailwind CSS 3
      </view>
      <view class="mt-[16rpx] text-[52rpx] font-semibold leading-[1.12] text-slate-900">
        旧项目也能拥有清爽原子样式
      </view>
      <view class="mt-[20rpx] text-[28rpx] leading-relaxed text-slate-500">
        保留 Vue2 与 webpack 工程习惯，同时用 weapp-tailwindcss 输出小程序可识别的工具类。
      </view>
    </view>

    <view class="mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">能力速览</view>
      <view class="mt-[20rpx] flex flex-col gap-[16rpx]">
        <view class="rounded-[24rpx] border border-sky-200/70 bg-sky-50/80 px-[24rpx] py-[20rpx] text-sky-700">
          <view class="text-[28rpx] font-semibold">任意值与图片背景</view>
          <view class="mt-[8rpx] text-[24rpx] opacity-80">classArray 覆盖任意颜色与图片背景。</view>
        </view>
        <view class="rounded-[24rpx] border border-violet-200/70 bg-violet-50/80 px-[24rpx] py-[20rpx] text-violet-700">
          <view class="text-[28rpx] font-semibold">条件编译</view>
          <view class="mt-[8rpx] text-[24rpx] opacity-80">ifdef / wx 前缀继续验证多端分支。</view>
        </view>
        <view class="rounded-[24rpx] border border-emerald-200/70 bg-emerald-50/80 px-[24rpx] py-[20rpx] text-emerald-700">
          <view class="text-[28rpx] font-semibold">@apply 宏</view>
          <view class="mt-[8rpx] text-[24rpx] opacity-80">scss 中组合工具类，方便沉淀团队语义类。</view>
        </view>
      </view>
    </view>

    <view class="mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">Playground</view>
      <view class="mt-[20rpx] rounded-[24rpx] px-[24rpx] py-[20rpx] text-white" :class="classArray">
        classArray + 任意值背景
      </view>
      <view class="mt-[20rpx] rounded-[24rpx] border border-dashed border-slate-200 bg-slate-50/80 p-[24rpx] text-[26rpx] text-slate-600">
        <view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500 rounded-[16rpx] px-[20rpx] py-[14rpx] text-white">
          样式条件编译：微信小程序为蓝色，其他端为红色
        </view>
        <view class="wx:bg-blue-500 -wx:bg-red-500 mt-[16rpx] rounded-[16rpx] px-[20rpx] py-[14rpx] text-white">
          自定义 wx 前缀条件编译
        </view>
        <view class="apply-class-0 mt-[16rpx]">@apply 条件编译方式 0</view>
        <view class="apply-class-1 mt-[16rpx]">@apply 条件编译方式 1</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      title: "Hello",
      flag: true,
      // https://uniapp.dcloud.net.cn/tutorial/vue-basics.html#class-%E4%B8%8E-style-%E7%BB%91%E5%AE%9A
      // 小程序端不支持 classObject 和 styleObject 语法。
      classObj: {
        'bg-[#123456]': true,
        'text-[#654321]': true
      },
      classArray: [true ? 'bg-[#123456]' : undefined, 'text-[#ffaaaa]', "bg-[url('https://xxx.com/xx.webp')]"]
    };
  },
  methods: {},
});
</script>

<style lang="scss">
.apply-class-0 {
  @apply ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500;
}

.apply-class-1 {
  // 这个需要在 tailwind.config.js 里进行自定义配置
  @apply wx:bg-blue-500 -wx:bg-red-500;
}
</style>
