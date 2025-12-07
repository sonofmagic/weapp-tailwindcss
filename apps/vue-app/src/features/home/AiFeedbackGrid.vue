<script setup lang="ts">
import { Activity, ArrowUpRight, CheckCircle2, Moon } from 'lucide-vue-next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { aiNotes } from '@/features/home/content'
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <CheckCircle2 class="h-5 w-5 text-primary" /> AI 生成守护
        </CardTitle>
        <CardDescription>tailwind-merge + tailwind-variants + lint/content 策略。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div v-for="note in aiNotes" :key="note.title" class="flex items-start gap-3 rounded-xl border p-3">
          <Badge :variant="note.status === 'ready' ? 'success' : 'warning'">
            {{ note.status === 'ready' ? 'ready' : 'watch' }}
          </Badge>
          <div class="space-y-1">
            <p class="font-medium leading-tight">{{ note.title }}</p>
            <p class="text-sm text-muted-foreground">{{ note.detail }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <Activity class="h-5 w-5 text-primary" /> 快速反馈表单
        </CardTitle>
        <CardDescription>用于收集文档/组件反馈，字段样式由 tokens 驱动。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-1">
          <label class="text-sm font-medium" for="name">称呼</label>
          <Input id="name" placeholder="例如：前端同学" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium" for="channel">偏好</label>
          <Input id="channel" placeholder="React / Vue / Mini Program" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium" for="needs">想看到的内容</label>
          <textarea
            id="needs"
            class="min-h-[96px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="例如：更多 tailwind-variants 配方、AI 提示样例"
          />
        </div>
        <div class="flex items-center gap-2">
          <Button class="gap-2">
            提交反馈
            <ArrowUpRight class="h-4 w-4" />
          </Button>
          <Badge variant="outline" tone="ghost" class="gap-1">
            <Moon class="h-3 w-3" /> 支持暗色
          </Badge>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
