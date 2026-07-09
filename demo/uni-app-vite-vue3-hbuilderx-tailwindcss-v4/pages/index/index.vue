<template>
	<view class="bg-[#123456]">
		<view class="template-corpus-card flex flex-col gap-3 rounded-[28rpx] border border-slate-200/80 bg-gradient-to-br from-slate-900/95 to-slate-700/95 p-4 text-white shadow-xl wx:bg-blue-500 not-wx:bg-red-500 any-hover:bg-slate-800">
			<view class="template-corpus-radial bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[48px] py-[24rpx] text-[#123456]">
				template corpus radial
			</view>
			<view class="template-corpus-space space-y-2">
				<view class="rounded-[20rpx] bg-white/70 px-3 py-1 text-[26rpx] text-slate-700">space item 1</view>
				<view :class="templateCorpusDynamicClass">space item 2</view>
			</view>
			<view class="template-corpus-apply">apply corpus</view>
			<view class="template-corpus-hover h-16 w-32 rounded-[20rpx] bg-green-200/70" hover-class="!bg-[gray] after:!content-['good_work!']">
				hover corpus
			</view>
		</view>
		<image class="w-[120px] h-[6rem]" src="/static/logo.png"></image>
		<view class="text-[#888800]">
			<text class="title">{{title}}</text>
		</view>
		<view class="theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 dark:bg-zinc-900 dark:text-zinc-50">
			uni-app HBuilderX Tailwind CSS v4 system dark
			<view class="theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
				uni-app HBuilderX Tailwind CSS v4 manual dark
			</view>
		</view>
		<t-button t-class="bg-[#0977ee] text-[31rpx]" t-class-content="px-[29rpx]">issue 977 t-class</t-button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				templateCorpusDynamicClass: 'template-corpus-dynamic bg-[#68c828] text-[100rpx] w-[323px] h-[45px]'
			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>

</style>
