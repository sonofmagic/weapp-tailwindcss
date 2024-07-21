<script setup lang="ts">
onLaunch(() => {
  console.log(uni.getSystemInfoSync().statusBarHeight)
  console.log('App Launch')
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
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
@layer components {
  .float-btn {
    @apply rounded-full w-10 h-10 flex justify-center items-center pointer-events-auto bg-white shadow text-2xl dark:bg-slate-900 dark:shadow-gray-700;
  }
}
@import 'uview-plus/index.scss';
</style>
