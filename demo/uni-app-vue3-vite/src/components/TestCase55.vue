<template>
  <view :class="[classname, 'overflow-hidden', 'relative']">https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/55</view>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue';

interface Props {
  className?: string;
  src?: string;
}
const props = withDefaults(defineProps<Props>(), {
  className: '',
  src: '',
});

const emit = defineEmits(['click']);

const show = ref<boolean>(false);
const transition = ref<boolean>(true);
const classname = ref<string>('');

watch(
  () => props.className,
  (nv, ov) => {
    classname.value = props.className;
  },
  {
    immediate: true,
  }
);
</script>

<style scoped>
</style>