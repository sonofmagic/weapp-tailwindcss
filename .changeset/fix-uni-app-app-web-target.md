---
"weapp-tailwindcss": patch
---

修复普通 uni-app App WebView 构建的生成目标推断，`UNI_PLATFORM=app/app-plus` 默认切换为 `web` 输出族；uni-app x `UNI_UTS_PLATFORM=app-*` 原生 App 目标继续保留小程序/uvue 兼容输出，不新增 `target: 'app'`。
