---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 `uni-app x` 的 `uvue/nvue` 样式目标会输出宿主不支持 CSS 的问题。

- 在 `uvue` 目标下过滤非 class selector，避免继续输出 `space-x-*`、`space-y-*` 这类组合器选择器。
- 在 `uvue` 目标下过滤不兼容声明，例如 `display: block`、`display: inline-flex`、`display: grid`、`grid-template-columns`、`gap`、`min-height: 100vh`。
- 新增 `uniAppX.uvueUnsupported` 配置，支持 `error | warn | silent`，默认 `warn`。
- 当策略为 `warn` 时，跳过不兼容 utility 并输出包含 class 名与来源文件的警告，避免 HBuilderX 因非法 CSS 直接报错。
