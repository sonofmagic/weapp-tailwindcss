---
"weapp-tailwindcss": patch
---

优化 Tailwind CSS v4 demo 的热更新路径：Vite 生成模式在增量构建中复用 source candidates、CSS 生成结果和 runtime class set，仅在候选类或 CSS source 真正变化时刷新对应资源，避免 `bg-[#00ffff]` 这类任意值类名触发全量扫描和全量 CSS 生成。

修复非主包 CSS 在候选类变化后可能复用旧缓存的问题，确保子包和独立分包热更新时 WXML/JS 中的新类名与 WXSS 输出同步更新。

Tailwind CSS v4 的入口选择改为跟随 Vite CSS 模块 id，并通过内部 source-id 标记精确绑定生成后的 WXSS 与原始 CSS source，不再按 `app`、`main`、`index` 这类文件名猜测入口。
