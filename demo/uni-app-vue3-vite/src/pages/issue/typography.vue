<template>
  <div>
    <rich-text :nodes="nodes"></rich-text>
  </div>
</template>

<script lang="ts" setup>
import { html } from './typography.js'
const nodes = `<article class="prose max-w-none tracking-widest text-justify leading-loose text-xl text-black my-4">${html}</article>`
</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@config "./tailwind.config.js";
</style>