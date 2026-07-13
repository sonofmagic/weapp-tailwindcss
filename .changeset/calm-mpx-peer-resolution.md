---
"weapp-tailwindcss": patch
---

修复 Mpx 构建存在多个 peer 依赖实例时 loader 与依赖模板混用的问题，根据 Webpack compilation 已注册的模板锁定实际拥有编译图的 `@mpxjs/webpack-plugin`，避免构建报错并保持 Tailwind 样式转换正常。
