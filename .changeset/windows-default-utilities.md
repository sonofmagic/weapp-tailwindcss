---
"weapp-tailwindcss": patch
"weapp-style-injector": patch
---

修复 Windows 下 CSS import 转义路径导致默认源码扫描失效、标准 utility 与 spacing 变量缺失的问题。统一入口路径解析、CSS 请求序列化和主题文件定位。

扩展所有 demo 的 Windows、macOS、Linux CLI 验收，覆盖生产、开发首编译、连续源码修改及 Web 刷新。修复百度小程序 CSS 产物身份与重放、入口 chunk 的独立样式引用、Webpack 生成前后的 CSS/JS 边界和 Rspack 已注册 loader 的增量生成；修复 uni 样式注入入口缓存跨构建失效。原生目标保持已有接入边界，仅验收 CLI 构建，不声明设备或 utility 样式覆盖。Refs #1159。
