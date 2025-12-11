<script setup lang="ts">
import { Atom, Blocks, Code2, Droplets, Paintbrush2, Sparkle } from 'lucide-vue-next'
import type { Component } from 'vue'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CssInJsDemo from '@/features/history/CssInJsDemo.vue'
import CssModulesDemo from '@/features/history/CssModulesDemo.vue'
import HeadlessTokenDemo from '@/features/history/HeadlessTokenDemo.vue'
import PreprocessorDemo from '@/features/history/PreprocessorDemo.vue'
import RawCssDemo from '@/features/history/RawCssDemo.vue'
import UtilityFirstDemo from '@/features/history/UtilityFirstDemo.vue'

const stages: Array<{
  title: string
  desc: string
  icon: Component
  component: Component
}> = [
  { title: 'Raw CSS / BEM', desc: '零构建 + 全局命名，靠约定维护秩序', icon: Blocks, component: RawCssDemo },
  { title: 'Sass / Less 预处理', desc: '变量/混入脚本化复用，快速主题切换', icon: Droplets, component: PreprocessorDemo },
  { title: 'CSS Modules', desc: '编译期哈希，作用域隔离，适合组件库', icon: Code2, component: CssModulesDemo },
  { title: 'CSS-in-JS', desc: 'ThemeProvider + 运行时/编译期动态样式', icon: Paintbrush2, component: CssInJsDemo },
  { title: 'Utility-first', desc: 'Tailwind/Uno + cva 变体 + content 摇树', icon: Atom, component: UtilityFirstDemo },
  { title: 'Headless + tokens', desc: 'tokens → variants → primitives，AI 友好', icon: Sparkle, component: HeadlessTokenDemo },
]
</script>

<template>
  <section class="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <Sparkle class="h-5 w-5 text-primary" /> 样式方案阶段 Demo 墙
        </CardTitle>
        <CardDescription>把文档里的代码片段落到 Vue Demo，看到每个阶段的工程化能力。</CardDescription>
      </CardHeader>
    </Card>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card v-for="stage in stages" :key="stage.title" class="overflow-hidden">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <component :is="stage.icon" class="h-5 w-5 text-primary" />
            {{ stage.title }}
          </CardTitle>
          <CardDescription>{{ stage.desc }}</CardDescription>
        </CardHeader>
        <CardContent>
          <component :is="stage.component" />
        </CardContent>
      </Card>
    </div>
  </section>
</template>
