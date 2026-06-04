<template>
  <div class="aaa">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  options: {
    virtualHost: true,
  },
  props: {

  },
  setup() {
    return {}
  }
})
</script>

<style scoped></style>