<template>
  <div class="inner">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'Web',
}
</script>

<style lang="less">
.inner {
  margin-bottom: 10px;
  width: 100%;
  text-align: center;
}
</style>
