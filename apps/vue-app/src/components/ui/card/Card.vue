<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { cn } from "@/lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('rounded-2xl border bg-card/80 shadow-sm backdrop-blur transition hover:border-primary/30', props.class)">
    <slot />
  </div>
</template>
