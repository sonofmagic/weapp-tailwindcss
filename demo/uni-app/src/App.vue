<script lang="ts">
import Vue from 'vue'
import bus from './bus'
export default Vue.extend({
  // @ts-ignore
  mpType: 'app',
  onLaunch() {
    console.log('App Launch')
    bus.promise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('App Launch and get token')
        resolve(undefined)
      }, 1000);
    })
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
})
</script>

<style lang="scss">
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
/*每个页面公共css */
@import "uview-ui/index.scss";
</style>
