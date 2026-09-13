---
'@weapp-tailwindcss/runtime': patch
'@weapp-tailwindcss/merge': patch
---

修复 `twMerge` 处理以数字开头的变体类名（如 `2xl:` 等）时的转义与冲突消解问题。

- 在 `wrapClassAggregator` 中对包含空格的多类名字符串进行分词处理，使每个类名 Token 都能独立应用完整的 escape/unescape 前缀逻辑。
- 解决数字开头变体类名在小程序运行时冲突未消解、或因丢失下划线前缀导致样式在真机及模拟器中失效的问题。
