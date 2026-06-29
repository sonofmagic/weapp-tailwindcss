---
"weapp-style-injector": patch
---

修复分包样式注入在 Webpack、Taro Vite 与 uni-app H5 产物中的边界处理，避免 H5 分包页面误生成小程序样式后缀并丢失页面原始样式；新增同一分包内多样式入口配置，可分别向 pages、components 与 `*.weapp.*`、`*.ali.*` 等平台源码文件注入不同入口；同时新增独立的 uni-app、MPX、Taro Webpack、Taro Vite 分包集成回归项目。
