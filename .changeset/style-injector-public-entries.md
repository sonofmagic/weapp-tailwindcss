---
"weapp-style-injector": patch
---

收口 `weapp-style-injector` 的公开导出入口，移除未文档化的 `uni-app`、`taro`、`subpackage` 深入口，保留根入口、通用 Vite/Webpack 插件入口以及 uni-app/Taro 的 Vite/Webpack 预设入口。
