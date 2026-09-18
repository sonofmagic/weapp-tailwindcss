---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

将共享生成流程、Vite 产物清理、Webpack 兼容和 Harmony apply 的样式变换归入 PostCSS 包，保留主包编排接口，减少重复解析、声明签名计算和未命中规则克隆。

继续统一源码追踪、主题与引用组装、import 改写、候选扫描和入口指纹；删除重复的 inline/config/source 解析，复用单次调用的 CSS 分析结果，同时保持文件解析、平台和构建会话归主包管理。
