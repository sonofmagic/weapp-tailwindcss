---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

将 CSS 资源位置依赖分析迁入 PostCSS，通过 tokenizer 识别转义的 url 和 import，避免相对资源转换跨目录共享缓存，并排除字符串及注释中的伪资源语法。
