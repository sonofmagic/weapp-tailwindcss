<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"

import { cn } from "@/lib/utils"

import type { BadgeVariants } from "."
import { badgeVariants } from "."

interface Props {
  variant?: BadgeVariants["variant"]
  tone?: BadgeVariants["tone"]
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()

const badgeClass = computed(() => cn(badgeVariants({ variant: props.variant, tone: props.tone }), props.class))
</script>

<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>
