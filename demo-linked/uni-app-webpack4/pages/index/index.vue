<template>
	<view class="w-screen flex flex-col items-center">
		<image class="w-12 h-12" src="../../static/logo.png"></image>
		<navigator url="/pagesA/index">pagesA</navigator>
		<navigator url="/pagesB/index">pagesB</navigator>
		<view>
			<text class="text-[44px] text-gray-800">{{title}} World</text>
		</view>
		<view :class="[
      flag?'bg-red-900':'bg-[#fafa00]',
      ]">Toggle</view>
		<view :class="{
        'bg-[#fafa00]':flag===true,
      }">Toggle</view>
		<view class="p-[20px] -mt-2 mb-[-20px] ">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view>
		<view class="space-y-[1.6rem]">
			<view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
			<view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px]
				text-[20px] leading-[0.9]</view>
			<view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
			<view
				class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">
				Hello</view>
			<view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px]
				border-[#098765] border-solid border-opacity-[0.44]</view>
			<view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
				<div>1</div>
				<div>2</div>
				<div>3</div>
			</view>
			<view class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300">
				Default
			</view>
		</view>
	</view>
</template>

<script>
	import Vue from "vue";

	export default Vue.extend({
		data() {
			return {
				title: "Hello",
				flag: true,
			};
		},
		onLoad() {},
		methods: {},
	});
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin: 200rpx auto 50rpx auto;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
