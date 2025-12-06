<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Activity, ArrowUpRight, CheckCircle2, Code2, Moon, Sparkles, Sun, Table2, Wand2 } from 'lucide-vue-next'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ThemeMode = 'light' | 'dark'

const theme = ref<ThemeMode>('light')

onMounted(() => {
  theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
})

watch(theme, value => {
  document.documentElement.classList.toggle('dark', value === 'dark')
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

const checklist = [
  '类名全部取自 tokens，无裸色值/尺寸',
  'variants 集中在 cva/tailwind-variants，默认值已声明',
  '使用 cn(tailwind-merge) 避免顺序冲突',
  '断点覆盖 mobile-first，关键组件在 sm/md/lg 自检',
  'content 精准匹配，避免动态字符串拼接类名',
]

const insights = [
  {
    title: '设计 token 对齐',
    desc: 'OKLCH 色板 + @theme inline，暗色模式一键切换',
    badge: 'tokens',
  },
  {
    title: '变体工厂',
    desc: 'cva/tailwind-variants 集中声明 variants 与 compoundVariants',
    badge: 'variants',
  },
  {
    title: 'AI 友好',
    desc: '提示模板 + merge 校验，产出可复制的类名',
    badge: 'ai',
  },
]

const aiNotes = [
  {
    title: 'tailwind-merge 守护',
    detail: "cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'px-6')",
    status: 'ready',
  },
  {
    title: 'tailwind-variants 配方',
    detail: 'tv({ base, slots, variants, defaultVariants }) 描述 slots',
    status: 'ready',
  },
  {
    title: 'lint & content',
    detail: 'content 仅指向 src，禁止字符串拼接类名',
    status: 'watch',
  },
]

const tokensSummary = [
  { label: '色板', value: 'OKLCH + data-theme' },
  { label: '间距', value: '4/8/12/16 阶梯' },
  { label: '半径', value: '--radius, sm/md/lg/xl' },
]

const variantPreview = computed(() => [
  { label: 'Default', className: buttonVariants({ variant: 'default' }) },
  { label: 'Outline', className: buttonVariants({ variant: 'outline', size: 'lg' }) },
  { label: 'Ghost', className: buttonVariants({ variant: 'ghost', size: 'sm' }) },
])

const styleComparisons = [
  {
    title: 'Raw CSS / BEM',
    note: '全局命名，简单直接，但靠纪律避免覆盖/冲突。',
    output: '单一 CSS，适合小体量页面。',
    tag: '基础',
  },
  {
    title: 'Sass / Less',
    note: '变量/混入提升复用，仍在全局作用域，需要限制嵌套。',
    output: '编译期内联变量，产物体积取决于复用度。',
    tag: '预处理',
  },
  {
    title: 'CSS Modules',
    note: '类名哈希隔离，适合组件库；主题切换需额外 token 管线。',
    output: '作用域隔离 CSS，可发布/复用友好。',
    tag: '组件边界',
  },
  {
    title: 'CSS-in-JS',
    note: 'props 驱动样式，动态能力强；需关注运行时/SSR 注水体积。',
    output: '运行时注入或编译提取的样式，适合高度动态场景。',
    tag: '运行时',
  },
  {
    title: 'Tailwind',
    note: '类名即样式，JIT + content 精准摇树，生态完善。',
    output: '按需生成原子类，依赖 tokens/variants 约束。',
    tag: 'utility',
  },
  {
    title: 'Headless + cva/tv',
    note: 'API 与样式解耦，集中声明 variants/compoundVariants。',
    output: 'class builder + merge 去重，适合设计体系与 AI 流水线。',
    tag: 'headless',
  },
  {
    title: 'Vue <style scoped>',
    note: 'SFC 编译时 data-v 隔离，快速落地中小模块。',
    output: 'scoped CSS 与原子类共存，易于局部修改。',
    tag: 'SFC',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/60 text-foreground">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 pb-2 pt-6">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles class="h-4 w-4 text-primary" />
        <span>原子化 CSS 专题 Demo · Vue</span>
      </div>
      <div class="flex items-center gap-2">
        <Badge variant="brand" tone="ghost">cva · tailwind-merge</Badge>
        <Button variant="secondary" size="sm" class="gap-2" @click="toggleTheme">
          <component :is="theme === 'dark' ? Sun : Moon" class="h-4 w-4" />
          {{ theme === 'dark' ? '浅色' : '深色' }}
        </Button>
      </div>
    </div>

    <main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-14">
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
                <pre class="whitespace-pre-wrap text-[11px] leading-5">const button = tv({ base, slots, variants })
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
              <button
                v-for="item in variantPreview"
                :key="item.label"
                :class="cn(item.className, 'gap-2')"
              >
                {{ item.label }}
              </button>
            </div>
            <div class="rounded-xl border bg-muted/50 p-3 text-xs text-muted-foreground">
              `buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto' })`
            </div>
            <div class="rounded-xl border border-dashed bg-background/70 p-3 text-sm space-y-1">
              <div class="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 class="h-4 w-4 text-emerald-500" /> tailwind-merge 去重：`p-4 p-2` → `p-2`
              </div>
              <div class="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 class="h-4 w-4 text-emerald-500" /> compoundVariants：`variant=brand & size=lg` 追加阴影
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

      <section class="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <Code2 class="h-5 w-5 text-primary" /> AI 生成守护
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
    </main>
  </div>
</template>
