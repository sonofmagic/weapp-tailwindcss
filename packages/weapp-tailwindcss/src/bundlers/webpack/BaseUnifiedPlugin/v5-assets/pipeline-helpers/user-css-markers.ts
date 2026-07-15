import { postcss } from '@weapp-tailwindcss/postcss'

export function collectWebpackAssetUserCssMarkers(source: string) {
  const markers = new Set<string>()
  for (const match of source.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
    markers.add(`class:${match[1]}`)
  }
  for (const match of source.matchAll(/@(?:-[\w-]+-)?keyframes\s+((?:\\.|[-\w\u00A0-\uFFFF])+)/gi)) {
    markers.add(`keyframes:${match[1]}`)
  }
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors) {
        if (!/(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i.test(selector)) {
          markers.add(`selector:${selector.trim().replace(/\s+/g, ' ')}`)
        }
      }
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          markers.add(`custom-property:${decl.prop}`)
        }
      })
    })
    root.walkAtRules('font-face', (rule) => {
      rule.walkDecls('font-family', (decl) => {
        markers.add(`font-face:${decl.value.trim()}`)
      })
    })
  }
  catch {
    // 保留原始生成 CSS，继续交给 finalize 处理声明级兼容降级。
  }
  return markers
}
