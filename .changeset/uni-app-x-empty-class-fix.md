---
"weapp-tailwindcss": patch
---

修复 uni-app x 模板在处理空 `class` 或空 `:class` 属性时触发 MagicString “Cannot overwrite a zero-length range” 异常的问题。

同时为 uni-app x 模板管线补齐 `customAttributes` 配置支持，可在 Vue 模板中自定义需要转译的属性规则，并兼容 `disabledDefaultTemplateHandler` 行为。
