---
"weapp-tailwindcss": patch
---

稳定 Tailwind v4 的 source-aware 生成链路：Web target 保留 Vite 已生成的普通与第三方 CSS，CSS 候选只从 `@apply` 和 `@source inline(...)` 等结构化宏提取，避免将声明值误识别为工具类；同时改进多入口候选归属，并串行处理同一文件的 Vite HMR source snapshot，防止旧 revision 覆盖最新候选集合。
