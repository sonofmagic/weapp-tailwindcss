---
"weapp-tailwindcss": patch
---

修复 Mpx 项目存在多个 peer 依赖实例时错误选中非项目插件的问题，确保 loader 与项目注册的依赖模板使用同一份 `@mpxjs/webpack-plugin`，避免构建报错并保持 Tailwind 样式转换正常。
