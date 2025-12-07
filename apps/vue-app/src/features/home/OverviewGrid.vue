<script setup lang="ts">
import { Activity, ArrowUpRight, Code2, Table2, Wand2 } from 'lucide-vue-next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tokensSummary, insights } from '@/features/home/content'
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
    <Card class="relative overflow-hidden">
      <CardHeader class="flex flex-row items-start justify-between">
        <div class="space-y-2">
          <Badge variant="brand" class="w-fit">Atomic CSS · Tailwind</Badge>
          <CardTitle class="text-2xl">设计系统与类名的单一真相来源</CardTitle>
          <CardDescription>
            使用 tokens、variants 和 merge 让 UI 可组合、可摇树、可被 AI 生成且安全上线。
          </CardDescription>
        </div>
        <div class="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:block">
          <div class="flex items-center gap-1"><Activity class="h-4 w-4" /> Runtime safe</div>
        </div>
      </CardHeader>
      <CardContent class="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div class="space-y-3 lg:w-2/3">
          <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span
              v-for="item in tokensSummary"
              :key="item.label"
              class="inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1"
            >
              <Wand2 class="h-3 w-3" />
              {{ item.label }}: {{ item.value }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button class="gap-2">
              立即查看文档
              <ArrowUpRight class="h-4 w-4" />
            </Button>
            <Button variant="outline" class="gap-2" size="sm">
              tailwind-variants 配方
            </Button>
            <Button variant="ghost" size="sm" class="gap-2">
              cva 变体
              <Code2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div class="lg:w-1/3">
          <div class="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
            <div class="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">variants</div>
            <pre class="whitespace-pre-wrap text-[11px] leading-5">const button = tv({ base, slots, variants, defaultVariants })
button({ intent: 'primary', size: 'lg' })
// tailwind-merge 兜底去重</pre>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <Table2 class="h-5 w-5 text-primary" /> 结构化看板
        </CardTitle>
        <CardDescription>围绕 token / variants / merge / AI 的四个支柱。</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-3">
        <div v-for="item in insights" :key="item.title" class="flex items-start gap-3 rounded-xl border p-3">
          <Badge variant="subtle" tone="ghost" class="mt-0.5">
            {{ item.badge }}
          </Badge>
          <div class="space-y-1">
            <p class="font-medium leading-tight">{{ item.title }}</p>
            <p class="text-sm text-muted-foreground">{{ item.desc }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
