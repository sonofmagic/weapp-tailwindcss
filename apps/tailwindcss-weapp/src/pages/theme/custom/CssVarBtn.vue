<script lang="ts" setup>
const emit = defineEmits(['click'])

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    class="bg-primary text-primary-content transition-colors duration-300"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped></style>
