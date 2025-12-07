<script setup lang="ts">
import { ArrowUpRight, Github } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'

const props = withDefaults(defineProps<{ href?: string }>(), {
  href: 'https://github.com/sonofmagic/weapp-tailwindcss',
})
</script>

<template>
  <Button
    as="a"
    variant="outline"
    size="sm"
    class="gap-2"
    :href="props.href"
    target="_blank"
    rel="noreferrer"
  >
    <Github class="h-4 w-4" />
    GitHub
    <ArrowUpRight class="h-3 w-3" />
  </Button>
</template>
