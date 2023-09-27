<script lang="ts">

import { defineComponent } from 'vue'
import { onLaunch, onShow, onHide, } from '@dcloudio/uni-app'

export default defineComponent({

  setup() {
    onLaunch(() => {

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

<style lang="scss">
@import './tailwind.scss';
</style>
