---
"weapp-tailwindcss": patch
---

修复 Gulp 生成模式在 dev/watch 场景下模板或脚本新增类名后，主 WXSS 复用旧 classSet 缓存导致缺少新增样式的问题。

修复 Webpack 生成模式在仅 JS 类名集合变化时主 WXSS 可能复用旧缓存的问题，并把稳定的 demo 热更新回归纳入 `pnpm e2e:ci`。

将核心包的大体量内部开发脚本迁移到私有 workspace 项目 `@weapp-tailwindcss/scripts`，发布包内仅保留安装生命周期所需脚本。
