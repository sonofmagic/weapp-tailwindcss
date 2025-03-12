<template>
  <view>
    <view class="w-20 h-20 peer bg-gray-300" hover-class="tapped" />
    <view class="w-20 h-20 peer-[.tapped]:bg-red-400 bg-blue-400"></view>
    <view class="bg-gradient-to-b from-[#2f73f1] to-[#4bcefd] w-[323px] h-[30px]"></view>
    <view class="bg-gradient-to-t from-[#2f73f1] to-[#4bcefd] w-[323px] h-[30px]"></view>
    <view class="bg-gradient-to-tr from-[#2f73f1] to-[#4bcefd] w-[323px] h-[30px]"></view>
    <view class="inline-block h-10 w-[50px] bg-amber-300">11223</view>
    <view class="space-x-2.5">
      <view class="inline-block h-10 w-[50px] bg-amber-800 border-4"></view>
      <view class="inline-block h-10 w-[50px] bg-amber-700"></view>
      <view class="inline-block h-10 w-[50px] bg-amber-600"></view>
      <view class="inline-block h-10 w-[50px] bg-amber-300"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { twMerge } from '@weapp-tailwindcss/merge/v3'
import { cva } from '@weapp-tailwindcss/merge/cva'

const button = cva(["font-semibold", "border", "rounded"], {
  variants: {
    intent: {
      primary: ["bg-blue-500", "text-white", "border-transparent"],
      // **or**
      // primary: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
      secondary: ["bg-white", "text-gray-800", "border-gray-400"],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
    },
    // `boolean` variants are also supported!
    disabled: {
      false: null,
      true: ["opacity-50", "cursor-not-allowed"],
    },
  },
  compoundVariants: [
    {
      intent: "primary",
      disabled: false,
      class: "hover:bg-blue-600",
    },
    {
      intent: "secondary",
      disabled: false,
      class: "hover:bg-gray-100",
    },
    {
      intent: "primary",
      size: "medium",
      // **or** if you're a React.js user, `className` may feel more consistent:
      // className: "uppercase"
      class: "uppercase",
    },
  ],
  defaultVariants: {
    intent: "primary",
    size: "medium",
    disabled: false,
  },
});

console.log(button())

console.log(twMerge('bg-[#434332] px-[32px]', 'bg-[#123324] px-[35px]'))
console.log(twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]'))
// → 'hover:bg-dark-red p-3 bg-[#B91C1C]'
</script>

<style lang="scss">
.peer~.peer-xxx {
  color: red;
}

// .xxx:invalid~.xxx-invalid:visible {
//   visibility: visible;
// }
.xxx~.xxx-invalid:visible {
  visibility: visible;
}

.peersdraft~.peer-checkedsdraftctext-sky-500 {
  --tw-text-opacity: 1;
  color: rgb(14 165 233 / var(--tw-text-opacity));
}
</style>