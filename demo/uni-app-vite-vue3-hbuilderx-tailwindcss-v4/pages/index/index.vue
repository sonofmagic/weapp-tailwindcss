<template>
	<view class="bg-[#123456]">
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
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello'
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
