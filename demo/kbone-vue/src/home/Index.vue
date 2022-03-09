<template>
  <div class="cnt">
    <Header></Header>
    <div>
      <a href="/test/list/321">当前页跳转</a>
      <a href="/test/detail/123" target="_blank">新开页面跳转</a>
      <button @click="onClickJump">当前页跳转</button>
      <button @click="onClickOpen">新开页面跳转</button>
    </div>
    <!-- vue-improve-loader -->
    <div check-reduce>
      <p>这段话不会在小程序里显示</p>
      <p>在构建的时候就会被 vue-improve-loader 给干掉了</p>
    </div>
    <!-- reduce-loader -->
    <Web>
      <p>这段话也不会在小程序里显示</p>
      <p>在构建的时候就会被 reduce-loader 给干掉了</p>
    </Web>
    <!-- 样式隐藏 -->
    <div class="for-web">
      <p>这段话也不会在小程序里显示</p>
      <p>在渲染时会被样式隐藏</p>
    </div>
    <view class="p-[20px] -mt-2 mb-[-20px] h-[200%]">p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</view>
    <view class="space-y-[1.6rem]">
      <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
      <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view>
      <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
      <view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view>
      <view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view>
      <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </view>
      <view class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300"> Default </view>
    </view>
    <view class="test">test</view>
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from 'vue'
import Header from '../common/Header.vue'
import Footer from '../common/Footer.vue'
import Web from 'reduce-loader!../common/Web.vue'
import 'reduce-loader!./web'

export default Vue.extend({
  name: 'Home',
  components: {
    Header,
    Footer,
    Web
  },
  created() {
    window.addEventListener('wxload', (query) => console.log('page1 wxload', query))
    window.addEventListener('wxshow', () => console.log('page1 wxshow'))
    window.addEventListener('wxready', () => console.log('page1 wxready'))
    window.addEventListener('wxhide', () => console.log('page1 wxhide'))
    window.addEventListener('wxunload', () => console.log('page1 wxunload'))

    if (process.env.isMiniprogram) {
      console.log('I am in miniprogram')
    } else {
      console.log('I am in Web')
    }
  },
  methods: {
    onClickJump() {
      window.location.href = '/test/list/123'
    },

    onClickOpen() {
      window.open('/test/detail/123')
    }
  }
})
</script>

<style lang="less">
.cnt {
  margin-top: 20px;
}

a,
button {
  display: block;
  width: 100%;
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-size: 20px;
  border: 1px solid #ddd;
}

.miniprogram-root {
  .for-web {
    display: none;
  }
}
</style>
