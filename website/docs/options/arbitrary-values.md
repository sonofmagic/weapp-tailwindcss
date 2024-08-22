# 使用 arbitrary 值

`arbitrary values` 是 `tailwindcss v3` 的重要更新内容，幸运的是你使用了本插件。

使得你可以使用 `tailwindcss v3` 强大的 `arbitrary values` 功能。

例如：

```html
<view :class="[flag?'bg-red-900':'bg-[#fafa00]']">bg-[#fafa00]</view>
<view :class="{'bg-[#098765]':flag===true}">bg-[#098765]</view>
<view class="p-[20px] -mt-2 !mb-[-20px] ">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view>
<view class="space-y-[1.6rem]">
  <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
  <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view>
  <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
  <view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view>
  <view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view>
  <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
    <view>1</view>
    <view>2</view>
    <view>3</view>
  </view>
</view>
```

或使用 `@apply`

```html
<template>
  <view class="hello">world</view>
</template>

<style lang="scss">
.hello {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}
</style>
```

详见 [tailwindcss/using-arbitrary-values 章节](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)
