---
"weapp-tailwindcss": patch
---

修复 css-macro 在 uni-app 样式条件编译之后才生成条件注释导致错误平台分支残留的问题。现在 Tailwind CSS v3/v4 生成链路会在最终样式输出前按当前平台裁剪 `ifdef` / `ifndef` 分支，避免微信小程序产物保留 `ifndef-[MP-WEIXIN]` 样式。
