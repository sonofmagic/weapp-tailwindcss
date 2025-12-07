<script setup lang="ts">
import { Table2 } from 'lucide-vue-next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { styleComparisons } from '@/features/home/content'
</script>

<template>
  <section>
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <Table2 class="h-5 w-5 text-primary" /> 样式方案对照速览
        </CardTitle>
        <CardDescription>对应文档「各样式方案 Demo」章节的速查表，可用来决定落地方案。</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="item in styleComparisons"
          :key="item.title"
          class="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3"
        >
          <div class="flex items-center justify-between">
            <p class="font-medium leading-tight">{{ item.title }}</p>
            <Badge variant="outline" tone="ghost">{{ item.tag }}</Badge>
          </div>
          <p class="text-sm text-muted-foreground">{{ item.note }}</p>
          <div class="text-xs text-muted-foreground">产物：{{ item.output }}</div>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
