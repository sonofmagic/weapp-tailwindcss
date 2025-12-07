import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { styleComparisons } from "@/features/home/content"
import { Table2Icon } from "@/features/home/icons"

export function StyleComparisonSection() {
  return (
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
  )
}
