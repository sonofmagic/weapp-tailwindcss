<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })

interface Props {
  class?: HTMLAttributes["class"]
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
})

const base =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
</script>

<template>
  <input v-bind="$attrs" :type="props.type" :class="cn(base, props.class)" />
</template>
