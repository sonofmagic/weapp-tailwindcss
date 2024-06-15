<template>
  <div :class="[{ popup: !maxFull }, className, { 'rounded-t-lg !w-full': type == 'bottom' && !className }]">
    issue134
    <Test className="rounded-t-lg !w-full"></Test>
  </div>
</template>

<script lang="ts">
import Test from './test.vue'
import Vue from 'vue'
// https://github.com/sonofmagic/weapp-tailwindcss/issues/134
export default Vue.extend({
  components: { Test },
  data() {
    return {
      className: '',
      maxFull: false,
      type: 'bottom'
    }
  }
})
</script>

<style lang="scss" scoped></style>