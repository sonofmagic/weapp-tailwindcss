<script setup lang="ts">
defineProps<{
  autoBack?: boolean
}>()

const slots = useSlots()
</script>

<template>
  <up-navbar :auto-back="autoBack" fixed bg-color="inherit" safe-area-inset-top placeholder>
    <template v-if="slots.left" #left>
      <slot name="left" />
    </template>
    <template v-if="slots.center" #center>
      <slot name="center" />
    </template>
    <template v-if="slots.right" #right>
      <slot name="right" />
    </template>
  </up-navbar>
</template>
