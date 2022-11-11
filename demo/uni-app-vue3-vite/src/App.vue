<script lang="ts">
import bus from './bus'
import { defineComponent } from 'vue'
import { onLaunch, onShow, onHide, } from '@dcloudio/uni-app'
import { ProxyUtils } from './utils'
const globalData = ProxyUtils({
    selected: 0,
    tabbarVisible: false,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
      },
      {
        pagePath: '/pages/issue/case55',
        text: 'case55',
      },
    ],
  })
export default defineComponent({
  globalData,
  setup() {
    onLaunch(() => {
      console.log('App Launch')
      bus.promise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('App Launch and get token')
          resolve(undefined)
        }, 1000);
      })
    })
    onShow(() => {
      console.log('App Show')
    })
    onHide(() => {
      console.log('App Hide')
    })
  }
})



</script>
<!-- <style>
@windicss;
</style> -->
<style lang="scss">
@import './tailwind.scss';
// @import './windi.scss';
@import "vk-uview-ui/index.scss";
</style>
