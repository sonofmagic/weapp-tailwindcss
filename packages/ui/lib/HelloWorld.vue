<script setup lang="ts">
withDefaults(defineProps<{
  msg?: string
}>(), {
  msg: 'Hello World',
})
</script>

<template>
  <div class="p-2">
    <div class="rounded-2xl p-2">
      {{ msg }}
    </div>
  </div>
</template>

<style scoped>
.a {
  color: aliceblue;
}
</style>
