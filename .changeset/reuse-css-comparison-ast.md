---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

对同一份待比较的 CSS 延迟解析一次，并在规则文本索引与声明索引之间共享只读语法树，减少生成样式恢复时的重复解析；索引完成后释放语法树，保留条件规则、声明优先级及解析失败时的保守处理。
