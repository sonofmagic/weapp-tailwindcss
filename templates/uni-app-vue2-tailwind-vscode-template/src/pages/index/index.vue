<template>
  <view class="w-screen flex flex-col items-center">
    <view
      class="bg-[url(https://pic1.zhimg.com/v2-3ee20468f54bbfefcd0027283b21aaa8_720w.jpg)] bg-[length:100%_100%] bg-no-repeat w-screen h-[41.54vw]">
    </view>

    <view class="after:content-['uni-app-vue2-tailwind-vscode-template'] text-sky-400"></view>


    <view class="text-gray-900/75 mb-2 before:text-sky-500 before:content-['让我们开始神奇的_tailwindcss_开发吧！']"></view>
    <view>
      <view class="text-lg font-semibold">uview-ui 2 控件示例</view>
      <view>
        <u-button :customStyle="{ width: '200px' }" text="月落"></u-button>
        <u-cell-group>
          <u-cell icon="setting-fill" title="个人设置"></u-cell>
          <u-cell icon="integral-fill" title="会员等级" value="新版本"></u-cell>
          <u-cell value="内容">
            <view slot="title" class="u-slot-title">
              <text class="u-cell-text text-[#00aaaa]">单元格</text>
            </view>
          </u-cell>
        </u-cell-group>

      </view>
    </view>

    <view class="text-lg font-semibold">写法示例</view>
    <view :class="classArray">classArray bg-url</view>
    <view>
      <view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">
        样式的条件编译:微信小程序为蓝色，不是微信小程序为红色
      </view>

      <view class="wx:bg-blue-500 -wx:bg-red-500">
        <view>自定义配置的方式进行样式条件编译</view>
        <view>相关配置见根目录下的tailwind.config.js</view>
      </view>

      <view class="apply-class-0">@apply 条件编译方式0</view>
      <view class="apply-class-1">@apply 条件编译方式1</view>
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
