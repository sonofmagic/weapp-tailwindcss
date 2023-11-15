<template>
  <view>
    <view class="w-20 h-20 peer bg-gray-300" hover-class="tapped" />
    <view class="w-20 h-20 peer-[.tapped]:bg-red-400 bg-blue-400"></view>
  </view>
</template>

<script setup>

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