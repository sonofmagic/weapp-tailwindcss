<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { cn } from "@/lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('flex flex-col gap-2 p-4 pb-2', props.class)">
    <slot />
  </div>
</template>
