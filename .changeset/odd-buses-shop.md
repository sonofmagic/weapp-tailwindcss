---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind v4 `space-x-*` 在小程序端生成不兼容方向伪类导致的构建产物报错问题：

- 在选择器转换阶段清理 `:-webkit-any(...)`、`:-moz-any(...)`、`:lang(...)` 相关分支，避免输出微信开发者工具不支持的选择器。
- 对 `:not(...)` 包裹的方向条件保留主体选择器并移除条件；对纯方向分支选择器直接移除，避免产生无效 CSS。
- 补充 `selectorParser` 回归测试，覆盖上述 RTL/language 伪类清理逻辑。
