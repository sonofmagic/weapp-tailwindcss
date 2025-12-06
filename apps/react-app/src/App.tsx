import { useEffect, useMemo, useState } from "react"
import type { ComponentType } from "react"
import { Activity, ArrowUpRight, CheckCircle2, Code2, Moon, Sparkles, Sun, Table2, Wand2 } from "lucide-react"
import type { LucideIcon, LucideProps } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

const checklist = [
  "类名全部取自 tokens，无裸色值/尺寸",
  "variants 集中在 cva/tailwind-variants，默认值已声明",
  "使用 cn(tailwind-merge) 避免顺序冲突",
  "断点覆盖 mobile-first，关键组件在 sm/md/lg 自检",
  "content 精准匹配，避免动态字符串拼接类名",
]

const insights = [
  {
    title: "设计 token 对齐",
    desc: "OKLCH 色板 + @theme inline，暗色模式一键切换",
    badge: "tokens",
  },
  {
    title: "变体工厂",
    desc: "cva/tailwind-variants 集中声明 variants 与 compoundVariants",
    badge: "variants",
  },
  {
    title: "AI 友好",
    desc: "提示模板 + merge 校验，产出可复制的类名",
    badge: "ai",
  },
]

const aiNotes = [
  {
    title: "tailwind-merge 守护",
    detail: "cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'px-6')",
    status: "ready",
  },
  {
    title: "tailwind-variants 配方",
    detail: "tv({ base, slots, variants, defaultVariants }) 描述 slots",
    status: "ready",
  },
  {
    title: "lint & content",
    detail: "content 仅指向 src，禁止字符串拼接类名",
    status: "watch",
  },
]

const styleComparisons = [
  {
    title: "Raw CSS / BEM",
    note: "全局命名，容易理解，但靠纪律控制覆盖/命名冲突。",
    output: "单一 CSS，适合一次性页面或极小应用。",
    tag: "基础",
  },
  {
    title: "Sass / Less",
    note: "变量/混入提高复用；仍是全局作用域，需要 lint 控制嵌套。",
    output: "编译期内联变量，产物体积取决于复用度。",
    tag: "预处理",
  },
  {
    title: "CSS Modules",
    note: "类名哈希隔离，易于复用，但主题切换需额外 token 管线。",
    output: "作用域隔离的 CSS，适合可发布组件库。",
    tag: "组件边界",
  },
  {
    title: "CSS-in-JS",
    note: "props 驱动样式，动态能力强；需关注运行时/SSR 注水体积。",
    output: "运行时注入样式（或编译时提取），适合高度动态场景。",
    tag: "运行时",
  },
  {
    title: "Tailwind",
    note: "类名即样式，JIT + content 精准摇树，生态齐全。",
    output: "按需生成的原子类，依赖 tokens/variants 约束。",
    tag: "utility",
  },
  {
    title: "Headless + cva/tv",
    note: "API 与样式解耦，variants/compoundVariants 集中声明。",
    output: "class builder + merge 去重，最适合设计体系与 AI 流水线。",
    tag: "headless",
  },
  {
    title: "Vue <style scoped>",
    note: "SFC 编译时加 data-v 隔离，快速落地小型模块。",
    output: "scoped CSS + 原子类可混用，适合中小型 Vue 模块。",
    tag: "SFC",
  },
]

const variantPreview = [
  { label: "Default", className: buttonVariants({ variant: "default" }) },
  { label: "Outline", className: buttonVariants({ variant: "outline", size: "lg" }) },
  { label: "Ghost", className: buttonVariants({ variant: "ghost", size: "sm" }) },
]

// React 19 JSX expects components to return ReactNode | Promise<ReactNode>, so
// cast lucide-react icons once to a plain component type to satisfy TS.
const toIconComponent = (Icon: LucideIcon): ComponentType<LucideProps> =>
  Icon as unknown as ComponentType<LucideProps>

const ActivityIcon = toIconComponent(Activity)
const ArrowUpRightIcon = toIconComponent(ArrowUpRight)
const CheckCircle2Icon = toIconComponent(CheckCircle2)
const Code2Icon = toIconComponent(Code2)
const MoonIcon = toIconComponent(Moon)
const SparklesIcon = toIconComponent(Sparkles)
const SunIcon = toIconComponent(Sun)
const Table2Icon = toIconComponent(Table2)
const Wand2Icon = toIconComponent(Wand2)

function App() {
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
  }, [theme])

  const tokensSummary = useMemo(
    () => [
      { label: "色板", value: "OKLCH + data-theme" },
      { label: "间距", value: "4/8/12/16 阶梯" },
      { label: "半径", value: "--radius, sm/md/lg/xl" },
    ],
    []
  )

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/60 text-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-2 pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SparklesIcon className="size-4 text-primary" />
          <span>原子化 CSS 专题 Demo · React</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" tone="ghost">cva · tailwind-merge</Badge>
          <Button variant="secondary" size="sm" className="gap-2" onClick={toggleTheme}>
            {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            {theme === "dark" ? "浅色" : "深色"}
          </Button>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-14">
        <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-2">
                <Badge variant="brand" className="w-fit">Atomic CSS · Tailwind</Badge>
                <CardTitle className="text-2xl">设计系统与类名的单一真相来源</CardTitle>
                <CardDescription>
                  使用 tokens、variants 和 merge 让 UI 可组合、可摇树、可被 AI 生成且安全上线。
                </CardDescription>
              </div>
              <div className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:block">
                <div className="flex items-center gap-1"><ActivityIcon className="size-4" /> Runtime safe</div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="space-y-3 lg:w-2/3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {tokensSummary.map(item => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1"
                    >
                      <Wand2Icon className="size-3" />
                      {item.label}: {item.value}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="gap-2">
                    立即查看文档
                    <ArrowUpRightIcon className="size-4" />
                  </Button>
                  <Button variant="outline" className="gap-2" size="sm">
                    tailwind-variants 配方
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    cva 变体
                    <Code2Icon className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/3">
                <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">variants</div>
                  <pre className="whitespace-pre-wrap text-[11px] leading-5">
{`const button = tv({ base, slots, variants, defaultVariants })
button({ intent: 'primary', size: 'lg' })
// tailwind-merge 兜底去重`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Table2Icon className="size-5 text-primary" /> 结构化看板
              </CardTitle>
              <CardDescription>围绕 token / variants / merge / AI 的四个支柱。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {insights.map(item => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border p-3">
                  <Badge variant="subtle" tone="ghost" className="mt-0.5">
                    {item.badge}
                  </Badge>
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wand2Icon className="size-5 text-primary" /> 变体与 merge 演示
              </CardTitle>
              <CardDescription>按钮由 cva 定义 variants，`cn` 内置 tailwind-merge 防止冲突。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {variantPreview.map(item => (
                  <button key={item.label} className={cn(item.className, "gap-2")}>{item.label}</button>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/50 p-3 text-xs text-muted-foreground">
                <code className="block font-mono text-[11px] leading-5">
                  {"buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto' })"}
                </code>
              </div>
              <div className="rounded-xl border border-dashed bg-background/70 p-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2Icon className="size-4 text-emerald-500" /> tailwind-merge 去重：
                  <code className="font-mono text-xs text-foreground">p-4 p-2</code>
                  <span>→</span>
                  <code className="font-mono text-xs text-foreground">p-2</code>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2Icon className="size-4 text-emerald-500" /> compoundVariants：
                  <code className="font-mono text-xs text-foreground">variant=brand &amp; size=lg</code>
                  追加阴影
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2Icon className="size-5 text-primary" /> AI Ready 清单
              </CardTitle>
              <CardDescription>模型可复制、可校验的交付格式。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {checklist.map(item => (
                <div key={item} className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/30 p-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code2Icon className="size-5 text-primary" /> AI 生成守护
              </CardTitle>
              <CardDescription>tailwind-merge + tailwind-variants + lint/content 策略。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aiNotes.map(note => (
                <div key={note.title} className="flex items-start gap-3 rounded-xl border p-3">
                  <Badge variant={note.status === "ready" ? "success" : "warning"}>
                    {note.status === "ready" ? "ready" : "watch"}
                  </Badge>
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{note.title}</p>
                    <p className="text-sm text-muted-foreground">{note.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ActivityIcon className="size-5 text-primary" /> 快速反馈表单
              </CardTitle>
              <CardDescription>用于收集文档/组件反馈，字段样式由 tokens 驱动。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="name">称呼</label>
                <Input id="name" placeholder="例如：前端同学" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="channel">偏好</label>
                <Input id="channel" placeholder="React / Vue / Mini Program" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="needs">想看到的内容</label>
                <textarea
                  id="needs"
                  className={cn(
                    "min-h-[96px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  placeholder="例如：更多 tailwind-variants 配方、AI 提示样例"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button className="gap-2">
                  提交反馈
                  <ArrowUpRightIcon className="size-4" />
                </Button>
                <Badge variant="outline" tone="ghost" className="gap-1">
                  <MoonIcon className="size-3" /> 支持暗色
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Table2Icon className="size-5 text-primary" /> 样式方案对照速览
              </CardTitle>
              <CardDescription>可在文档的「各样式方案 Demo」章节找到对应片段，下面是速查表。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {styleComparisons.map(item => (
                <div key={item.title} className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium leading-tight">{item.title}</p>
                    <Badge variant="outline" tone="ghost">{item.tag}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.note}</p>
                  <div className="text-xs text-muted-foreground">产物：{item.output}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default App
