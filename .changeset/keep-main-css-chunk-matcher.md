---
"weapp-tailwindcss": patch
---

统一使用 `mainCssChunkMatcher(name, appType)` 作为主样式匹配配置，移除 `mainCssChunk` 配置入口。默认行为仍然不根据 `app`、`main`、平台后缀或框架类型推断主样式，避免在多小程序、H5、iOS、Android、鸿蒙等输出中产生框架耦合。
