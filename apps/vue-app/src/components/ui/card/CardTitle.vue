<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { cn } from "@/lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()
</script>

<template>
  <h3 :class="cn('text-lg font-semibold leading-tight', props.class)">
    <slot />
  </h3>
</template>
