<template>
  <view>
    <van-steps :steps="steps" :active="0" />
    <Layout />
  </view>
</template>

<script lang="ts">
import Vue from 'vue'
import Layout from '@/components/tailwind/Layout.vue'

export default Vue.extend({
  components: {
    Layout
  },
  data() {
    return {
      steps: [
        {
          text: '步骤一',
          desc: '描述信息'
        },
        {
          text: '步骤二',
          desc: '描述信息'
        },
        {
          text: '步骤三',
          desc: '描述信息'
        },
        {
          text: '步骤四',
          desc: '描述信息'
        }
      ]
    }
  },

  methods: {}
})
</script>

<style lang="scss">
</style>
