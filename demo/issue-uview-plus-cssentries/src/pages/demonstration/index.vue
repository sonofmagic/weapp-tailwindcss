<script setup lang="ts">
const message = "Hello uview-plus";
</script>

<template>
  <view class="flex flex-col gap-3 p-[24rpx] text-[#0f0]">
    <view class="hello-scss">
      Hello SCSS
    </view>
    <up-button type="primary">
      {{ message }}
    </up-button>
    <up-button plain hairline type="success">
      Plain uview-plus
    </up-button>
    <up-button t-class="bg-[#0977ee] text-[31rpx]" t-class-content="px-[29rpx]">
      issue 977 t-class
    </up-button>
  </view>
</template>

<style lang="scss" scoped>
.hello-scss {
  color: #f00;
}
</style>
