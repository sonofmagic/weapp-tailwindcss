---
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v4 主样式预处理对每条规则重复扫描整份 CSS AST 的性能问题。处理大规模样式时复用单次 Root 级内容变量判断，保持 `--tw-content` 初始化和 CSS 输出语义不变。

Related to #1238。
