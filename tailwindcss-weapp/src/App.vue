<script setup lang="ts">
onLaunch(() => {
  // console.log(uni.getSystemInfoSync().statusBarHeight)
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
@import 'uview-plus/index.scss';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer components {
  .float-btn {
    @apply rounded-full w-10 h-10 flex justify-center items-center pointer-events-auto bg-white shadow text-2xl dark:bg-slate-900 dark:shadow-gray-700;
  }
}

.u-cell__body {
  @apply text-slate-900 dark:text-slate-200 #{!important};
}

.u-cell__title-text {
  @apply dark:text-slate-400 text-slate-700 #{!important};
}

.u-collapse-item__content__text {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.u-line {
  @apply border-slate-100 dark:border-slate-800 #{!important};
}

.u-cell {
}

.u-cell--clickable {
  @apply dark:bg-slate-800 #{!important};
}

.u-navbar__content,
.u-status-bar {
  @apply bg-white dark:bg-slate-900 #{!important};
}

page {
  @apply bg-white dark:bg-slate-900; // #{!important};
}

.u-search__content,
.u-search__content__input {
  @apply dark:bg-slate-800 #{!important};
  @apply transition-colors duration-500;
}
</style>
