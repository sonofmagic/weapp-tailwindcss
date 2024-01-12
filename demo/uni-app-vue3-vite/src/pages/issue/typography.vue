<template>
  <rich-text :nodes="nodes"></rich-text>
</template>

<script lang="ts" setup>
import { html } from './typography.js'
const nodes = html
</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@config "./tailwind.config.js";
</style>