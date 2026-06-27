---
"@weapp-tailwindcss/postcss": patch
---

优化 PostCSS 生成器样式处理性能，复用 CSS source 扫描结果，减少重复 `root.toString()` 与重复解析 source entries 的开销；同时导出 source scan 工具并补齐覆盖率门禁与回归测试。
