<template>
	<view class="min-h-screen bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[32rpx] py-[40rpx] text-slate-800">
		<view class="rounded-[32rpx] border border-slate-100/70 bg-white/90 p-[40rpx] shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
			<view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">Uni App Webpack · Tailwind CSS 4</view>
			<view class="mt-[16rpx] text-[52rpx] font-semibold leading-[1.12] text-slate-900">
				webpack 工程里的轻量原子样式
			</view>
			<view class="mt-[20rpx] text-[28rpx] leading-relaxed text-slate-500">
				保留传统 uni-app 工程结构，用 Tailwind v4 和 weapp-tailwindcss 产出小程序可用样式。
			</view>
		</view>

		<view class="mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
			<view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">动态样式</view>
			<view class="mt-[20rpx] rounded-[24rpx] px-[24rpx] py-[20rpx] text-white shadow-lg" :class="className">
				{{ title }} · :class 任意色值
			</view>
			<view class="mt-[20rpx] grid grid-cols-2 gap-[16rpx]">
				<view class="rounded-[24rpx] border border-sky-200/70 bg-sky-50/80 px-[24rpx] py-[20rpx] text-sky-700">
					<view class="text-[28rpx] font-semibold">CSS 入口</view>
					<view class="mt-[8rpx] text-[24rpx] opacity-80">@source 扫描源码</view>
				</view>
				<view class="rounded-[24rpx] border border-emerald-200/70 bg-emerald-50/80 px-[24rpx] py-[20rpx] text-emerald-700">
					<view class="text-[28rpx] font-semibold">小程序输出</view>
					<view class="mt-[8rpx] text-[24rpx] opacity-80">wxss 稳定转换</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			title: 'Hello Tailwind',
			className: 'bg-[#877878]'
		}
	},
	onLoad() {

	},
	methods: {

	}
});
</script>
