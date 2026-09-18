---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/react-native": patch
"@weapp-tailwindcss/experimental": patch
"tailwindcss-injector": patch
---

将共享生成流程、Vite 产物清理、Webpack 兼容和 Harmony apply 的样式变换归入 PostCSS 包，保留主包编排接口，减少重复解析、声明签名计算和未命中规则克隆。

继续统一源码追踪、主题与引用组装、import 改写、候选扫描和入口指纹；删除重复的 inline/config/source 解析，复用单次调用的 CSS 分析结果，同时保持文件解析、平台和构建会话归主包管理。

将 React Native CSS 编译迁入独立 PostCSS native 子入口，保留原编译器 API、精确类名过滤、告警与稳定 ID；运行时不加载 CSS 编译依赖。

将 injector 的纯指令插入和 LightningCSS 的实验性样式转换归入 PostCSS。模板依赖追踪仍由 injector 管理；LightningCSS 引擎仍只由实验入口加载，稳定入口不导入实验实现。
