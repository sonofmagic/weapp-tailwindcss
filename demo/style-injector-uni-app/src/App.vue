<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('style injector uni-app launch')
})
onShow(() => {
  console.log('style injector uni-app show')
})
onHide(() => {
  console.log('style injector uni-app hide')
})
</script>
