<template>
  <div>
    <rich-text :nodes="nodes"></rich-text>
  </div>
</template>

<script lang="ts" setup>
import { html } from './typography.js'
import transform from './plugin/transform'

// transform(s)
const nodes = html


</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@config "./tailwind.config.js";

</style>