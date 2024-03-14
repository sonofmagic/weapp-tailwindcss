<template>
  <view class="index container bg-[#ffffff]" :class="flag ? 'text-[#aaaaaa]' : 'text-[#fafafa]'">
    <Plain></Plain>
  </view>
</template>

<script lang="ts" setup>
import Plain from '../../components/Plain.vue'
import jsxRender from './render'
import First from '../../components/ui/First'
import './index.scss'
import { ref } from 'vue'
const msg = ref('Hello world!')
const flag = ref(true)
const classArray = ['bg-[#543254]', 'h-[100px]', 'w-[300px]', "bg-[url('https://xxx.com/xx.webp')]"]
const wildContent = '******'
</script>
