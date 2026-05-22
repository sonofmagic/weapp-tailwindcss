---
"weapp-tailwindcss": patch
---

修复小程序最终样式中被提到前面的 base/theme 规则顺序，确保用户样式仍然能排在这些基础规则之前，不再被 `:host/page` 和 `view/text` 重排压到后面。
