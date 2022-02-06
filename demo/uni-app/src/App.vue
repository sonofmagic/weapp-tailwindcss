<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  mpType: 'app',
  onLaunch() {
    console.log('App Launch')
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
// 小程序不需要 'base' 'components'，里面标签是给 html 准备的
@import 'tailwindcss/base';
// @import 'tailwindcss/components';
@import 'tailwindcss/utilities';
/*每个页面公共css */
</style>
