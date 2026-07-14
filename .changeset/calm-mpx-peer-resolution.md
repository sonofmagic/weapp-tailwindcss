---
"weapp-tailwindcss": patch
---

修复 Mpx 构建存在多个 peer 依赖实例时 loader 与依赖模板混用的问题，根据 Webpack compilation 已注册的模板锁定实际拥有编译图的 `@mpxjs/webpack-plugin`，避免构建报错并保持 Tailwind 样式转换正常。同时修复 Tailwind CSS v4 用户 `@layer` 规则因格式缩进未命中插入位置而被追加到 utilities 之后的问题，按 CSS 结构恢复 `base`、`components`、`utilities` 与未分层样式的层叠顺序，并避免兼容回放重复输出 layer 规则。
