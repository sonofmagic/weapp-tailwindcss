import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button-variants"
import { checklist } from "@/features/home/content"
import { CheckCircle2Icon, Wand2Icon } from "@/features/home/icons"
import { cn } from "@/lib/utils"

const variantPreview = [
  { label: "Default", className: buttonVariants({ variant: "default" }) },
  { label: "Outline", className: buttonVariants({ variant: "outline", size: "lg" }) },
  { label: "Ghost", className: buttonVariants({ variant: "ghost", size: "sm" }) },
]

export function VariantGrid() {
  return (
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
  )
}
