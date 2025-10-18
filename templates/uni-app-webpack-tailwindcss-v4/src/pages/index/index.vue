<template>
	<view class="content">
		<image class="bg-[#123456]" src="../../static/logo.png"></image>
		<view>
			<view :class="className" class="h-[100px] rounded-3xl">{{ title }}</view>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			title: 'Hello',
			className: 'bg-[#877878]'
		}
	},
	onLoad() {

	},
	methods: {

	}
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
