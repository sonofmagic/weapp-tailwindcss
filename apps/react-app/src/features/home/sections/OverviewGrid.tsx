import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { tokensSummary, insights } from "@/features/home/content"
import { ActivityIcon, ArrowUpRightIcon, Code2Icon, Table2Icon, Wand2Icon } from "@/features/home/icons"

export function OverviewGrid() {
  return (
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
  )
}
