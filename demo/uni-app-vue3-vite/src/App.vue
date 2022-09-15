<script setup lang="ts">
import bus from './bus'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
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
</script>
<style lang="scss">
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
</style>
