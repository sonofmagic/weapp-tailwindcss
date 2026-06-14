---
"weapp-tailwindcss": major
---

移除 `mainCssChunkMatcher` 配置项，改为使用不绑定框架或小程序平台的 `mainCssChunk(name, appType)` 显式声明主 CSS chunk。默认行为仍然不根据 `app`、`main`、平台后缀或框架类型推断主样式，避免在多小程序、H5、iOS、Android、鸿蒙等输出中产生框架耦合。
