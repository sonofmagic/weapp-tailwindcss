<template>
  <div>
    <view class="container">container</view>
    <span class="decoration-clone bg-gradient-to-b from-yellow-400 to-red-500 text-transparent">
      Hello<br>
      World
    </span>
    <div class="box-border h-32 w-32 p-4 border-4 border-blue-400 bg-blue-200 rounded-md">
      <div class="h-full w-full bg-blue-400 bg-stripes bg-stripes-white"></div>
      <!-- ... -->
    </div>
    <div class="box-content h-32 w-32 p-4 border-4 border-green-400 bg-green-200 rounded-md">
      <div class="h-full w-full bg-green-400 bg-stripes bg-stripes-white"></div>
      <!-- ... -->
    </div>
    <view :class="[d]" class="item" :key="d" v-for="d in displayArray">{{d}}</view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      displayArray: [
        'block',
        'inline-block',
        'inline',
        'flex',
        'inline-flex',
        'table',
        'inline-table',
        'table-caption',
        'table-cell',
        'table-column',
        'table-column-group',
        'table-footer-group',
        'table-header-group',
        'table-row-group',
        'table-row',
        'flow-root',
        'grid',
        'inline-grid',
        'contents',
        'list-item',
        'hidden'
      ]
    }
  }
})
</script>

<style lang="scss" scoped>
</style>