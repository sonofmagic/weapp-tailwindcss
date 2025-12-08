<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Wand2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { checklist } from '@/features/home/content'
import { cn } from '@/lib/utils'

const variantPreview = computed(() => [
  { label: 'Default', className: buttonVariants({ variant: 'default' }) },
  { label: 'Outline', className: buttonVariants({ variant: 'outline', size: 'lg' }) },
  { label: 'Ghost', className: buttonVariants({ variant: 'ghost', size: 'sm' }) },
])
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <Wand2 class="h-5 w-5 text-primary" /> 变体与 merge 演示
        </CardTitle>
        <CardDescription>按钮由 cva 定义 variants，`cn` 内置 tailwind-merge 防止冲突。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <button v-for="item in variantPreview" :key="item.label" :class="cn(item.className, 'gap-2')">
            {{ item.label }}
          </button>
        </div>
        <div class="rounded-xl border bg-muted/50 p-3 text-xs text-muted-foreground">
          <code class="block font-mono text-[11px] leading-5">
            buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto' })
          </code>
        </div>
        <div class="rounded-xl border border-dashed bg-background/70 p-3 text-sm space-y-1">
          <div class="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 class="h-4 w-4 text-emerald-500" /> tailwind-merge 去重：
            <code class="font-mono text-xs text-foreground">p-4 p-2</code>
            <span>→</span>
            <code class="font-mono text-xs text-foreground">p-2</code>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 class="h-4 w-4 text-emerald-500" /> compoundVariants：
            <code class="font-mono text-xs text-foreground">variant=brand & size=lg</code>
            追加阴影
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="h-full">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <CheckCircle2 class="h-5 w-5 text-primary" /> AI Ready 清单
        </CardTitle>
        <CardDescription>模型可复制、可校验的交付格式。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <div
          v-for="item in checklist"
          :key="item"
          class="flex items-start gap-2 rounded-lg border border-dashed bg-muted/30 p-2"
        >
          <span class="mt-0.5 text-primary">•</span>
          <span class="text-muted-foreground">{{ item }}</span>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
