---
"weapp-tailwindcss": minor
---

Vite 与 Webpack5 生成链路收敛为 Tailwind CSS v4 优先的 CSS-first/loader-first 管线，入口仍保留 `weapp-tailwindcss/vite` 与 `weapp-tailwindcss/webpack`。新管线要求使用 Tailwind CSS v4，并建议通过显式 CSS entry 或 `tailwindcss.v4.cssEntries/cssSources` 声明样式来源；不再依赖旧的隐式 CSS source 推断、Webpack 末端补偿生成或历史 MPX 专用 loader 排序兜底。
