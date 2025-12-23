<script lang="ts" setup>
const emit = defineEmits(['click'])

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    class="deep:bg-pink-600 deep:text-gray-300 fantasy:bg-pink-100 fantasy:text-gray-900 bg-pink-900 text-white transition-colors duration-300 dark:bg-pink-300 dark:text-gray-600"
    @click="onClick"
  >
    <slot />
  </button>
</template>
